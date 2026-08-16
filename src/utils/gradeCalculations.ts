import {
  calculateGpa,
  getGradePoints,
  GPA_GRADES,
  isAttendanceCompliant,
  isGpaGrade,
  MINIMUM_ATTENDANCE_PERCENTAGE,
} from '@/domain/academicRules';

export const gradeToPoints = (grade: string): number => {
  return getGradePoints(grade) ?? 0;
};

export const validateGrade = (grade: string): boolean => {
  return isGpaGrade(grade);
};

export const getValidGrades = (): string[] => {
  return [...GPA_GRADES];
};

export const computeSGPA = (
  subjects: Array<{ credits: number; grade?: string | null; isAudit?: boolean | null }>
): number => {
  return calculateGpa(subjects) ?? 0;
};

export const computeCGPA = (
  allSubjects: Array<{ credits: number; grade?: string | null; isAudit?: boolean | null }>
): number => {
  return calculateGpa(allSubjects) ?? 0;
};

export const getGradeColor = (grade?: string): string => {
  if (!grade) return 'secondary';

  switch (grade) {
    case 'A':
    case 'A-':
      return 'color-accent-light';
    case 'B':
    case 'B-':
      return 'color-primary-light';
    case 'C':
    case 'C-':
      return 'color-warning-light';
    default:
      return 'color-danger-light';
  }
};

export const getAttendanceStatus = (percentage: number): { status: string; color: string } => {
  if (percentage >= 90) return { status: 'Excellent', color: 'color-accent-light' };
  if (percentage >= 80) return { status: 'Good', color: 'color-primary-light' };
  if (isAttendanceCompliant(percentage)) {
    return { status: 'Minimum Met', color: 'color-warning-light' };
  }
  if (percentage < MINIMUM_ATTENDANCE_PERCENTAGE) {
    return { status: 'Below Minimum', color: 'color-danger-light' };
  }
  return { status: 'Poor', color: 'color-danger-light' };
};
