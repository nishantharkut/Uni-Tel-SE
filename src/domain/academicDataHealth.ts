import type { AttendanceRecord, MarksRecord, Semester, Subject } from '@/services/academicService';
import { buildAttendancePlan } from '@/domain/attendancePlanning';
import { getGradePoints, isGpaGrade } from '@/domain/academicRules';

export type AcademicHealthSeverity = 'critical' | 'warning' | 'info';

export interface AcademicHealthIssue {
  id: string;
  title: string;
  description: string;
  severity: AcademicHealthSeverity;
  count: number;
  route: string;
}

export interface AcademicHealthSummary {
  issues: AcademicHealthIssue[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalIssueCount: number;
  status: 'healthy' | 'needs-attention' | 'critical';
}

interface AcademicHealthInput {
  semesters: Semester[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
}

function normaliseKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function countDuplicateGroups<T>(items: T[], getKey: (item: T) => string): number {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.values()].filter((count) => count > 1).length;
}

function issue(
  id: string,
  title: string,
  description: string,
  severity: AcademicHealthSeverity,
  count: number,
  route: string
): AcademicHealthIssue | null {
  if (count <= 0) return null;
  return { id, title, description, severity, count, route };
}

export function auditAcademicDataHealth({
  semesters,
  subjects,
  attendance,
  marks,
}: AcademicHealthInput): AcademicHealthSummary {
  const semesterIds = new Set(semesters.map((semester) => semester.id));
  const subjectsBySemester = new Map<string, Subject[]>();
  subjects.forEach((subject) => {
    subjectsBySemester.set(subject.semester_id, [...(subjectsBySemester.get(subject.semester_id) ?? []), subject]);
  });

  const issues = [
    issue(
      'duplicate-semesters',
      'Duplicate semester numbers',
      'More than one semester record uses the same semester number.',
      'warning',
      countDuplicateGroups(semesters, (semester) => String(semester.number)),
      '/semesters'
    ),
    issue(
      'empty-semesters',
      'Semesters without subjects',
      'Semester records exist but no subjects have been added under them.',
      'info',
      semesters.filter((semester) => (subjectsBySemester.get(semester.id) ?? []).length === 0).length,
      '/semesters'
    ),
    issue(
      'duplicate-subjects',
      'Duplicate subject entries',
      'A subject name appears more than once in the same semester.',
      'warning',
      countDuplicateGroups(
        subjects,
        (subject) => `${subject.semester_id}:${normaliseKey(subject.name)}`
      ),
      '/semesters'
    ),
    issue(
      'missing-grades',
      'Subjects missing grades',
      'Some subjects are still missing final grades, so CGPA/earned-credit analysis is incomplete.',
      'info',
      subjects.filter((subject) => !subject.grade).length,
      '/semesters'
    ),
    issue(
      'failed-subjects',
      'Failed courses recorded',
      'Courses with F grade require backlog/repeat planning under the academic rules.',
      'critical',
      subjects.filter((subject) => isGpaGrade(subject.grade) && getGradePoints(subject.grade) === 0).length,
      '/semesters'
    ),
    issue(
      'duplicate-attendance',
      'Duplicate attendance records',
      'A subject has multiple attendance records in the same semester.',
      'warning',
      countDuplicateGroups(
        attendance,
        (record) => `${record.semester_id}:${normaliseKey(record.subject_name)}`
      ),
      '/attendance'
    ),
    issue(
      'invalid-attendance',
      'Invalid attendance counts',
      'Some attendance records have attended classes greater than total classes.',
      'critical',
      attendance.filter((record) => record.attended_classes > record.total_classes).length,
      '/attendance'
    ),
    issue(
      'low-attendance',
      'Attendance below minimum',
      'One or more courses are below the 75% attendance requirement.',
      'critical',
      attendance.filter((record) => buildAttendancePlan(record.attended_classes, record.total_classes).riskLevel === 'critical').length,
      '/attendance'
    ),
    issue(
      'duplicate-marks',
      'Duplicate marks records',
      'A subject has repeated records for the same exam type in the same semester.',
      'warning',
      countDuplicateGroups(
        marks,
        (record) => `${record.semester_id}:${normaliseKey(record.subject_name)}:${normaliseKey(record.exam_type)}`
      ),
      '/marks'
    ),
    issue(
      'marks-without-weightage',
      'Marks missing weightage',
      'Weighted planning is less reliable when marks records do not include assessment weightage.',
      'info',
      marks.filter((record) => !record.weightage || record.weightage <= 0).length,
      '/marks'
    ),
    issue(
      'invalid-marks',
      'Invalid marks records',
      'Some marks records have invalid totals or obtained marks greater than total marks.',
      'critical',
      marks.filter((record) => record.total_marks < 0 || record.obtained_marks < 0 || record.obtained_marks > record.total_marks).length,
      '/marks'
    ),
    issue(
      'orphan-records',
      'Records linked to missing semesters',
      'Subjects, marks, or attendance records reference a semester that is not present locally.',
      'warning',
      [
        ...subjects.map((subject) => subject.semester_id),
        ...attendance.map((record) => record.semester_id),
        ...marks.map((record) => record.semester_id),
      ].filter((semesterId) => !semesterIds.has(semesterId)).length,
      '/semesters'
    ),
  ].filter((entry): entry is AcademicHealthIssue => Boolean(entry));

  const criticalCount = issues
    .filter((entry) => entry.severity === 'critical')
    .reduce((total, entry) => total + entry.count, 0);
  const warningCount = issues
    .filter((entry) => entry.severity === 'warning')
    .reduce((total, entry) => total + entry.count, 0);
  const infoCount = issues
    .filter((entry) => entry.severity === 'info')
    .reduce((total, entry) => total + entry.count, 0);

  return {
    issues,
    criticalCount,
    warningCount,
    infoCount,
    totalIssueCount: criticalCount + warningCount + infoCount,
    status: criticalCount > 0 ? 'critical' : warningCount > 0 ? 'needs-attention' : 'healthy',
  };
}
