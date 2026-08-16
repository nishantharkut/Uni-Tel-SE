export const IIITM_UG_IPG_ORDINANCE_2025_URL =
  'https://www.iiitm.ac.in/public/uploads/media_uploads/1768561107_UP-IPG-ordinances-2025.pdf';

export const GPA_GRADES = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F'] as const;

export type GpaGrade = (typeof GPA_GRADES)[number];

export const NON_GPA_GRADES = ['I', 'S', 'X', 'NP', 'NF'] as const;

export type NonGpaGrade = (typeof NON_GPA_GRADES)[number];

export const GRADE_POINTS: Record<GpaGrade, number> = {
  A: 10,
  'A-': 9,
  B: 8,
  'B-': 7,
  C: 6,
  'C-': 5,
  D: 4,
  F: 0,
};

export const MINIMUM_ATTENDANCE_PERCENTAGE = 75;

export const ASSESSMENT_WEIGHTAGE_LIMITS = {
  minor: 30,
  internal: 30,
  major: 50,
} as const;

export type AssessmentCategory = keyof typeof ASSESSMENT_WEIGHTAGE_LIMITS;

export const DEFAULT_EXAM_TYPES = [
  'Minor Examination',
  'Major Examination',
  'Quiz',
  'Assignment',
  'Tutorial',
  'Laboratory Work',
  'Project',
  'Presentation',
  'Viva',
  'Other',
] as const;

export interface AcademicCourse {
  credits: number;
  grade?: string | null;
  isAudit?: boolean | null;
}

export function normalizeGrade(grade?: string | null): string | null {
  if (!grade) return null;

  const value = grade.trim().toUpperCase();
  if (!value) return null;

  switch (value) {
    case 'A(-)':
      return 'A-';
    case 'B(-)':
      return 'B-';
    case 'C(-)':
      return 'C-';
    default:
      return value;
  }
}

export function isGpaGrade(grade?: string | null): grade is GpaGrade {
  const normalized = normalizeGrade(grade);
  return GPA_GRADES.includes(normalized as GpaGrade);
}

export function isNonGpaGrade(grade?: string | null): grade is NonGpaGrade {
  const normalized = normalizeGrade(grade);
  return NON_GPA_GRADES.includes(normalized as NonGpaGrade);
}

export function getGradePoints(grade?: string | null): number | null {
  const normalized = normalizeGrade(grade);
  if (!isGpaGrade(normalized)) return null;
  return GRADE_POINTS[normalized];
}

export function isPassingGrade(grade?: string | null): boolean {
  const points = getGradePoints(grade);
  return points !== null && points >= GRADE_POINTS.D;
}

export function calculateGpa(courses: AcademicCourse[]): number | null {
  const applicableCourses = courses.filter((course) => {
    if (course.isAudit) return false;
    if (!Number.isFinite(course.credits) || course.credits <= 0) return false;
    return isGpaGrade(course.grade);
  });

  const totalCredits = applicableCourses.reduce((sum, course) => sum + course.credits, 0);
  if (totalCredits === 0) return null;

  const weightedPoints = applicableCourses.reduce((sum, course) => {
    const points = getGradePoints(course.grade) ?? 0;
    return sum + course.credits * points;
  }, 0);

  return Math.round((weightedPoints / totalCredits) * 100) / 100;
}

export function calculateEarnedCredits(courses: AcademicCourse[]): number {
  return courses.reduce((sum, course) => {
    if (course.isAudit || !Number.isFinite(course.credits) || course.credits <= 0) {
      return sum;
    }

    return isPassingGrade(course.grade) ? sum + course.credits : sum;
  }, 0);
}

export function isAttendanceCompliant(percentage: number): boolean {
  return percentage >= MINIMUM_ATTENDANCE_PERCENTAGE;
}

export function validateExamType(examType?: string | null): boolean {
  const value = examType?.trim();
  return Boolean(value && value.length >= 2 && value.length <= 100);
}

export function classifyAssessmentType(examType?: string | null): AssessmentCategory {
  const value = examType?.trim().toLowerCase() ?? '';

  if (value.includes('minor') || value.includes('mid')) {
    return 'minor';
  }

  if (value.includes('major') || value.includes('end')) {
    return 'major';
  }

  return 'internal';
}

export function validateMarks(obtained: number, total: number): boolean {
  if (!Number.isFinite(obtained) || !Number.isFinite(total)) return false;
  if (total < 0 || obtained < 0) return false;
  if (total === 0) return obtained === 0;
  return obtained <= total;
}

export function validateWeightage(weightage: number): boolean {
  return Number.isFinite(weightage) && weightage >= 0 && weightage <= 100;
}

export function getWeightageLimit(examType?: string | null): number {
  return ASSESSMENT_WEIGHTAGE_LIMITS[classifyAssessmentType(examType)];
}

export function validateAssessmentWeightage(examType: string | null | undefined, weightage: number): boolean {
  return validateWeightage(weightage) && weightage <= getWeightageLimit(examType);
}
