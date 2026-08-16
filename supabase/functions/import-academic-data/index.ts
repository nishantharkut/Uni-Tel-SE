
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportData {
  semesters?: Array<{
    number: number;
    subjects?: Array<{
      name: string;
      credits: number;
      grade?: string;
    }>;
    attendance?: Array<{
      subject_name: string;
      total_classes: number;
      attended_classes: number;
      note?: string;
    }>;
    marks?: Array<{
      subject_name: string;
      exam_type: string;
      total_marks: number;
      obtained_marks: number;
    }>;
  }>;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported_counts?: {
    semesters: number;
    subjects: number;
    attendance: number;
    marks: number;
  };
  errors?: string[];
}

function normaliseSemesterNumber(value: unknown): number {
  const parsed = parseInt(String(value).trim(), 10)
  if (isNaN(parsed)) return -1

  if (parsed > 12 && parsed % 10 === 0) {
    const deConcatenated = parsed / 10
    if (deConcatenated >= 1 && deConcatenated <= 12) {
      return deConcatenated
    }
  }

  return parsed
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { importData }: { importData: ImportData } = await req.json()

    const result: ImportResult = {
      success: true,
      message: '',
      imported_counts: {
        semesters: 0,
        subjects: 0,
        attendance: 0,
        marks: 0
      },
      errors: []
    }

    if (!importData.semesters || importData.semesters.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No semesters data provided'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each semester
    for (const semesterData of importData.semesters) {
      try {
        // Ensure number is a proper integer to avoid type-coercion bugs
        const semNumber = normaliseSemesterNumber(semesterData.number)
        if (isNaN(semNumber) || semNumber < 1 || semNumber > 12) {
          result.errors?.push(`Semester ${semesterData.number}: invalid semester number (must be between 1 and 12)`)
          continue
        }

        // Remove any legacy corrupted record for this semester number.
        // e.g. if semNumber is 7 and a record with number=70 exists (from an
        // old type-coercion bug where "7" + 0 === "70"), delete it first so
        // the upsert below produces a single, correctly-numbered record.
        // We start at legacyNumber >= 20 because semNumber=1 gives legacyNumber=10
        // which is a valid semester number and must not be removed.
        const legacyNumber = semNumber * 10
        if (legacyNumber >= 20 && legacyNumber <= 120) {
          await supabaseClient
            .from('semesters')
            .delete()
            .eq('user_id', user.id)
            .eq('number', legacyNumber)
        }

        // Create/update semester (total_credits is omitted; the trigger recalculates it)
        const { data: semester, error: semesterError } = await supabaseClient
          .from('semesters')
          .upsert({
            user_id: user.id,
            number: semNumber,
            source_json_import: true
          }, {
            onConflict: 'user_id,number'
          })
          .select()
          .single()

        if (semesterError) {
          result.errors?.push(`Semester ${semNumber}: ${semesterError.message}`)
          continue
        }

        result.imported_counts!.semesters++

        // Process subjects
        if (semesterData.subjects && semesterData.subjects.length > 0) {
          for (const subjectData of semesterData.subjects) {
            try {
              const subCredits = parseInt(String(subjectData.credits), 10)
              if (isNaN(subCredits)) {
                result.errors?.push(`Subject ${subjectData.name}: invalid credits value "${subjectData.credits}"`)
                continue
              }
              const { error: subjectError } = await supabaseClient
                .from('subjects')
                .upsert({
                  user_id: user.id,
                  semester_id: semester.id,
                  name: subjectData.name,
                  credits: subCredits,
                  grade: subjectData.grade,
                  source_json_import: true
                }, {
                  onConflict: 'user_id,semester_id,name'
                })

              if (subjectError) {
                result.errors?.push(`Subject ${subjectData.name}: ${subjectError.message}`)
              } else {
                result.imported_counts!.subjects++
              }
            } catch (error) {
              result.errors?.push(`Subject ${subjectData.name}: ${error.message}`)
            }
          }
        }

        // Process attendance
        if (semesterData.attendance && semesterData.attendance.length > 0) {
          for (const attendanceData of semesterData.attendance) {
            try {
              const totalClasses = parseInt(String(attendanceData.total_classes), 10)
              const attendedClasses = parseInt(String(attendanceData.attended_classes), 10)
              if (isNaN(totalClasses) || isNaN(attendedClasses)) {
                result.errors?.push(`Attendance ${attendanceData.subject_name}: invalid class count values`)
                continue
              }
              const { error: attendanceError } = await supabaseClient
                .from('attendance_records')
                .upsert({
                  user_id: user.id,
                  semester_id: semester.id,
                  subject_name: attendanceData.subject_name,
                  total_classes: totalClasses,
                  attended_classes: attendedClasses,
                  note: attendanceData.note,
                  source_json_import: true
                }, {
                  onConflict: 'user_id,semester_id,subject_name'
                })

              if (attendanceError) {
                result.errors?.push(`Attendance ${attendanceData.subject_name}: ${attendanceError.message}`)
              } else {
                result.imported_counts!.attendance++
              }
            } catch (error) {
              result.errors?.push(`Attendance ${attendanceData.subject_name}: ${error.message}`)
            }
          }
        }

        // Process marks
        if (semesterData.marks && semesterData.marks.length > 0) {
          for (const marksData of semesterData.marks) {
            try {
              const totalMarks = parseInt(String(marksData.total_marks), 10)
              const obtainedMarks = parseInt(String(marksData.obtained_marks), 10)
              if (isNaN(totalMarks) || isNaN(obtainedMarks)) {
                result.errors?.push(`Marks ${marksData.subject_name} ${marksData.exam_type}: invalid marks values`)
                continue
              }
              const { error: marksError } = await supabaseClient
                .from('marks_records')
                .insert({
                  user_id: user.id,
                  semester_id: semester.id,
                  subject_name: marksData.subject_name,
                  exam_type: marksData.exam_type,
                  total_marks: totalMarks,
                  obtained_marks: obtainedMarks,
                  source_json_import: true
                })

              if (marksError) {
                result.errors?.push(`Marks ${marksData.subject_name} ${marksData.exam_type}: ${marksError.message}`)
              } else {
                result.imported_counts!.marks++
              }
            } catch (error) {
              result.errors?.push(`Marks ${marksData.subject_name} ${marksData.exam_type}: ${error.message}`)
            }
          }
        }
      } catch (error) {
        result.errors?.push(`Semester ${semesterData.number ?? 'unknown'}: ${error.message}`)
      }
    }

    const totalImported = (result.imported_counts?.semesters || 0) + 
                         (result.imported_counts?.subjects || 0) + 
                         (result.imported_counts?.attendance || 0) + 
                         (result.imported_counts?.marks || 0)

    if (totalImported === 0) {
      result.success = false
      result.message = 'No data was imported successfully'
    } else {
      result.message = `Successfully imported ${totalImported} records`
      if (result.errors && result.errors.length > 0) {
        result.message += ` with ${result.errors.length} errors`
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Import function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        errors: [error.message]
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
