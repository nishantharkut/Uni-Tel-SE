
import { supabase } from '@/integrations/supabase/client';

export interface ImportData {
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

export interface ImportResult {
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

function normaliseSemesterNumber(val: unknown): number {
  const parsed = parseInt(String(val).trim(), 10);
  if (isNaN(parsed)) return -1;

  if (parsed > 12 && parsed % 10 === 0) {
    const deConcatenated = parsed / 10;
    if (deConcatenated >= 1 && deConcatenated <= 12) {
      return deConcatenated;
    }
  }

  return parsed;
}

/**
 * Normalises all numeric fields in the import payload to proper integers,
 * preventing type-coercion bugs (e.g. "7" + 0 → "70") that can occur when
 * the caller parses untrusted JSON or receives loosely-typed values.
 * Fields that cannot be parsed as integers are left unchanged so that the
 * edge function can report meaningful validation errors.
 */
function normaliseImportData(data: ImportData): ImportData {
  const toInt = (val: unknown): number => {
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? (val as number) : parsed;
  };

  return {
    ...data,
    semesters: (data.semesters ?? []).map(sem => ({
      ...sem,
      number: normaliseSemesterNumber(sem.number),
      subjects: (sem.subjects ?? []).map(sub => ({
        ...sub,
        credits: toInt(sub.credits),
      })),
      attendance: (sem.attendance ?? []).map(att => ({
        ...att,
        total_classes: toInt(att.total_classes),
        attended_classes: toInt(att.attended_classes),
      })),
      marks: (sem.marks ?? []).map(mark => ({
        ...mark,
        total_marks: toInt(mark.total_marks),
        obtained_marks: toInt(mark.obtained_marks),
      })),
    })),
  };
}

export const jsonImportService = {
  async importData(data: ImportData): Promise<ImportResult> {
    try {
      const normalisedData = normaliseImportData(data);
      const { data: result, error } = await supabase.functions.invoke('import-academic-data', {
        body: { importData: normalisedData }
      });

      if (error) {
        throw error;
      }

      return result as ImportResult;
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Import failed'
      };
    }
  },

  async exportData(): Promise<ImportData | null> {
    try {
      const { data: semesters } = await supabase
        .from('semesters')
        .select(`
          number,
          subjects:subjects!inner(name, credits, grade),
          attendance:attendance_records(subject_name, total_classes, attended_classes, note),
          marks:marks_records(subject_name, exam_type, total_marks, obtained_marks)
        `)
        .order('number');

      if (!semesters) return null;

      return {
        semesters: semesters.map(semester => ({
          number: normaliseSemesterNumber(semester.number),
          subjects: semester.subjects || [],
          attendance: semester.attendance || [],
          marks: semester.marks || []
        }))
      };
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }
};
