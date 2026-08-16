import type { AttendanceRecord, MarksRecord, Semester, Subject } from '@/services/academicService';
import { buildAttendancePlan } from '@/domain/attendancePlanning';
import { calculateEarnedCredits, calculateGpa, getGradePoints, isGpaGrade, MINIMUM_ATTENDANCE_PERCENTAGE, normalizeGrade } from '@/domain/academicRules';

export interface SemesterPerformanceTrend {
  semester_number: number;
  sgpa: number | null;
  total_credits: number | null;
  subjects_count: number;
  average_attendance: number | null;
  total_marks_records: number;
}

export interface GradeDistributionAnalytics {
  grade: string;
  count: number;
  percentage: number;
  total_credits: number;
}

export interface AttendanceAnalytics {
  total_subjects: number;
  average_attendance: number;
  good_attendance_count: number;
  poor_attendance_count: number;
  critical_attendance_count: number;
  attendance_trend: number;
}

export interface MarksPerformanceAnalytics {
  total_exams: number;
  average_percentage: number;
  excellent_performance_count: number;
  good_performance_count: number;
  average_performance_count: number;
  poor_performance_count: number;
  performance_trend: number;
}

export interface AcademicAchievement {
  achievement_type: string;
  achievement_description: string;
  achieved: boolean;
  progress_percentage: number;
  target_value: number;
  current_value: number;
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getSemesterNumber(semester: Semester): number {
  return Number.isFinite(semester.number) ? semester.number : 0;
}

function percentageForMark(record: MarksRecord): number | null {
  if (!Number.isFinite(record.total_marks) || record.total_marks <= 0) return null;
  if (!Number.isFinite(record.obtained_marks) || record.obtained_marks < 0) return null;
  return round((Math.min(record.obtained_marks, record.total_marks) / record.total_marks) * 100);
}

function isRecent(value: string, now = new Date()): boolean {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return now.getTime() - parsed.getTime() <= 30 * 24 * 60 * 60 * 1000;
}

function calculateRecentTrend<T>(
  records: T[],
  getValue: (record: T) => number | null,
  getCreatedAt: (record: T) => string
): number {
  const recentValues: number[] = [];
  const olderValues: number[] = [];

  records.forEach((record) => {
    const value = getValue(record);
    if (value === null) return;

    if (isRecent(getCreatedAt(record))) {
      recentValues.push(value);
    } else {
      olderValues.push(value);
    }
  });

  const recentAverage = average(recentValues);
  const olderAverage = average(olderValues);
  if (recentAverage === null || olderAverage === null) return 0;
  return round(recentAverage - olderAverage);
}

export function calculateSemesterPerformanceTrends(
  semesters: Semester[],
  subjects: Subject[],
  attendance: AttendanceRecord[],
  marks: MarksRecord[]
): SemesterPerformanceTrend[] {
  return [...semesters]
    .sort((a, b) => getSemesterNumber(a) - getSemesterNumber(b))
    .map((semester) => {
      const semesterSubjects = subjects.filter((subject) => subject.semester_id === semester.id);
      const semesterAttendancePercentages = attendance
        .filter((record) => record.semester_id === semester.id && record.total_classes > 0)
        .map((record) => buildAttendancePlan(record.attended_classes, record.total_classes).percentage);

      return {
        semester_number: getSemesterNumber(semester),
        sgpa: semester.sgpa ?? null,
        total_credits: calculateEarnedCredits(semesterSubjects),
        subjects_count: semesterSubjects.length,
        average_attendance: average(semesterAttendancePercentages),
        total_marks_records: marks.filter((record) => record.semester_id === semester.id).length,
      };
    });
}

export function calculateGradeDistributionAnalytics(subjects: Subject[]): GradeDistributionAnalytics[] {
  const gpaSubjects = subjects.filter((subject) => isGpaGrade(subject.grade));
  const totalSubjects = gpaSubjects.length;
  const gradeCounts = new Map<string, { count: number; total_credits: number }>();

  gpaSubjects.forEach((subject) => {
    const grade = normalizeGrade(subject.grade) ?? subject.grade ?? '';
    const current = gradeCounts.get(grade) ?? { count: 0, total_credits: 0 };
    gradeCounts.set(grade, {
      count: current.count + 1,
      total_credits: current.total_credits + (Number.isFinite(subject.credits) ? subject.credits : 0),
    });
  });

  return [...gradeCounts.entries()]
    .map(([grade, value]) => ({
      grade,
      count: value.count,
      percentage: totalSubjects === 0 ? 0 : round((value.count / totalSubjects) * 100),
      total_credits: value.total_credits,
    }))
    .sort((a, b) => (getGradePoints(b.grade) ?? -1) - (getGradePoints(a.grade) ?? -1));
}

export function calculateAttendanceAnalytics(attendance: AttendanceRecord[]): AttendanceAnalytics | null {
  const validRecords = attendance.filter((record) => record.total_classes > 0);
  if (validRecords.length === 0) return null;

  const percentages = validRecords.map((record) =>
    buildAttendancePlan(record.attended_classes, record.total_classes).percentage
  );

  const averageAttendance = average(percentages) ?? 0;

  return {
    total_subjects: new Set(validRecords.map((record) => record.subject_name.trim().toLowerCase())).size,
    average_attendance: averageAttendance,
    good_attendance_count: percentages.filter((percentage) => percentage >= MINIMUM_ATTENDANCE_PERCENTAGE).length,
    poor_attendance_count: percentages.filter((percentage) => percentage >= 65 && percentage < MINIMUM_ATTENDANCE_PERCENTAGE).length,
    critical_attendance_count: percentages.filter((percentage) => percentage < 65).length,
    attendance_trend: calculateRecentTrend(
      validRecords,
      (record) => buildAttendancePlan(record.attended_classes, record.total_classes).percentage,
      (record) => record.created_at
    ),
  };
}

export function calculateMarksPerformanceAnalytics(marks: MarksRecord[]): MarksPerformanceAnalytics | null {
  const percentages = marks
    .map(percentageForMark)
    .filter((value): value is number => value !== null);

  if (percentages.length === 0) return null;

  return {
    total_exams: percentages.length,
    average_percentage: average(percentages) ?? 0,
    excellent_performance_count: percentages.filter((percentage) => percentage >= 90).length,
    good_performance_count: percentages.filter((percentage) => percentage >= 80 && percentage < 90).length,
    average_performance_count: percentages.filter((percentage) => percentage >= 70 && percentage < 80).length,
    poor_performance_count: percentages.filter((percentage) => percentage < 70).length,
    performance_trend: calculateRecentTrend(marks, percentageForMark, (record) => record.created_at),
  };
}

export function calculateAcademicAchievements(
  subjects: Subject[],
  attendance: AttendanceRecord[],
  marks: MarksRecord[]
): AcademicAchievement[] {
  const cgpa = calculateGpa(subjects) ?? 0;
  const attendanceAnalytics = calculateAttendanceAnalytics(attendance);
  const marksAnalytics = calculateMarksPerformanceAnalytics(marks);
  const failedCourses = subjects.filter((subject) => isGpaGrade(subject.grade) && getGradePoints(subject.grade) === 0).length;

  return [
    {
      achievement_type: 'cgpa-target',
      achievement_description: 'Maintain a CGPA of 8.5 or above.',
      achieved: cgpa >= 8.5,
      progress_percentage: Math.min(100, round((cgpa / 8.5) * 100)),
      target_value: 8.5,
      current_value: cgpa,
    },
    {
      achievement_type: 'attendance-compliance',
      achievement_description: 'Keep average attendance at or above the 75% requirement.',
      achieved: (attendanceAnalytics?.average_attendance ?? 0) >= MINIMUM_ATTENDANCE_PERCENTAGE,
      progress_percentage: Math.min(100, round(((attendanceAnalytics?.average_attendance ?? 0) / MINIMUM_ATTENDANCE_PERCENTAGE) * 100)),
      target_value: MINIMUM_ATTENDANCE_PERCENTAGE,
      current_value: attendanceAnalytics?.average_attendance ?? 0,
    },
    {
      achievement_type: 'marks-performance',
      achievement_description: 'Maintain an average marks percentage of 75% or above.',
      achieved: (marksAnalytics?.average_percentage ?? 0) >= 75,
      progress_percentage: Math.min(100, round(((marksAnalytics?.average_percentage ?? 0) / 75) * 100)),
      target_value: 75,
      current_value: marksAnalytics?.average_percentage ?? 0,
    },
    {
      achievement_type: 'backlog-clearance',
      achievement_description: 'Keep recorded GPA subjects free of F grades.',
      achieved: failedCourses === 0,
      progress_percentage: failedCourses === 0 ? 100 : 0,
      target_value: 0,
      current_value: failedCourses,
    },
  ];
}
