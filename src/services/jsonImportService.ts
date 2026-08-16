
import { supabase } from '@/integrations/supabase/client';
import { normalizeGrade } from '@/domain/academicRules';

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
      weightage?: number;
      exam_date?: string;
      exam_time?: string;
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

type ExportSemesterRow = NonNullable<ImportData['semesters']>[number];

export interface ImportPreview {
  semesters: number;
  subjects: number;
  attendance: number;
  marks: number;
  warnings: string[];
}

export interface ParseImportResult {
  success: boolean;
  data?: ImportData;
  preview?: ImportPreview;
  message?: string;
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
  const toNumber = (val: unknown): number => {
    const parsed = parseFloat(String(val));
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
        grade: normalizeGrade(sub.grade) ?? undefined,
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
        weightage: mark.weightage === undefined ? undefined : toNumber(mark.weightage),
      })),
    })),
  };
}

function buildImportPreview(data: ImportData): ImportPreview {
  const semesters = data.semesters ?? [];
  const warnings: string[] = [];

  semesters.forEach((semester, index) => {
    if (normaliseSemesterNumber(semester.number) < 1) {
      warnings.push(`Semester at position ${index + 1} has an invalid semester number.`);
    }

    (semester.attendance ?? []).forEach((record) => {
      if (record.attended_classes > record.total_classes) {
        warnings.push(`${record.subject_name} attendance has attended classes greater than total classes.`);
      }
    });

    (semester.marks ?? []).forEach((record) => {
      if (record.total_marks < 0 || record.obtained_marks < 0 || record.obtained_marks > record.total_marks) {
        warnings.push(`${record.subject_name} ${record.exam_type} has invalid marks.`);
      }
    });
  });

  return {
    semesters: semesters.length,
    subjects: semesters.reduce((total, semester) => total + (semester.subjects?.length ?? 0), 0),
    attendance: semesters.reduce((total, semester) => total + (semester.attendance?.length ?? 0), 0),
    marks: semesters.reduce((total, semester) => total + (semester.marks?.length ?? 0), 0),
    warnings,
  };
}

function describeJsonParseError(error: unknown): string {
  if (error instanceof SyntaxError) {
    return `Invalid JSON syntax: ${error.message}. Check brackets, commas, quotes, and trailing commas.`;
  }

  return error instanceof Error ? error.message : 'Invalid import data.';
}

function isImportData(value: unknown): value is ImportData {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as ImportData).semesters));
}

export const jsonImportService = {
  parseJson(rawJson: string): ParseImportResult {
    if (!rawJson.trim()) {
      return {
        success: false,
        message: 'Paste a JSON export before importing.',
      };
    }

    try {
      const parsed = JSON.parse(rawJson);
      if (!isImportData(parsed)) {
        return {
          success: false,
          message: 'Import JSON must contain a top-level "semesters" array.',
        };
      }

      const normalisedData = normaliseImportData(parsed);
      return {
        success: true,
        data: normalisedData,
        preview: buildImportPreview(normalisedData),
      };
    } catch (error) {
      return {
        success: false,
        message: describeJsonParseError(error),
      };
    }
  },

  isEmptyExport(data: ImportData | null): boolean {
    if (!data?.semesters?.length) return true;
    return data.semesters.every((semester) =>
      !semester.subjects?.length
      && !semester.attendance?.length
      && !semester.marks?.length
    );
  },

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
      const { data: semesters } = await (supabase.from('semesters') as any)
        .select(`
          number,
          subjects:subjects!inner(name, credits, grade),
          attendance:attendance_records(subject_name, total_classes, attended_classes, note),
          marks:marks_records(subject_name, exam_type, total_marks, obtained_marks, weightage, exam_date, exam_time)
        `)
        .order('number');

      if (!semesters) return null;

      return {
        semesters: (semesters as ExportSemesterRow[]).map(semester => ({
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
