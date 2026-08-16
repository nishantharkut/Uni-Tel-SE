import type { AcademicSummary, AttendanceRecord, MarksRecord, Subject } from '@/services/academicService';
import { buildAttendancePlan } from '@/domain/attendancePlanning';
import { getGradePoints, isGpaGrade } from '@/domain/academicRules';
import type { UserPreferences } from '@/services/userPreferencesService';
import type { NotificationData } from '@/services/notificationService';

interface AcademicNotificationInput {
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
  subjects: Subject[];
  summary?: AcademicSummary | null;
  preferences: UserPreferences;
  now?: Date;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(date: Date, now: Date): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.round((target - start) / ONE_DAY_MS);
}

function parseExamDate(record: MarksRecord): Date | null {
  if (!record.exam_date) return null;
  const parsed = new Date(`${record.exam_date}T${record.exam_time || '00:00'}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildAcademicNotifications({
  attendance,
  marks,
  subjects,
  summary,
  preferences,
  now = new Date(),
}: AcademicNotificationInput): NotificationData[] {
  const notifications: NotificationData[] = [];

  if (preferences.notifications.attendanceWarnings) {
    attendance
      .filter((record) => record.total_classes > 0)
      .forEach((record) => {
        const plan = buildAttendancePlan(
          record.attended_classes,
          record.total_classes,
          preferences.attendanceWarningThreshold
        );
        if (plan.percentage >= preferences.attendanceWarningThreshold) return;

        notifications.push({
          id: `academic-attendance-${record.id}-${preferences.attendanceWarningThreshold}`,
          title: 'Attendance below threshold',
          message: `${record.subject_name} is at ${plan.percentage.toFixed(1)}%. ${plan.message}`,
          type: plan.riskLevel === 'critical' ? 'error' : 'warning',
          action_url: '/attendance',
          action_text: 'Review attendance',
        });
      });
  }

  if (preferences.notifications.examReminders && preferences.examReminderDays > 0) {
    marks.forEach((record) => {
      const examDate = parseExamDate(record);
      if (!examDate) return;
      const remainingDays = daysUntil(examDate, now);
      if (remainingDays < 0 || remainingDays > preferences.examReminderDays) return;

      notifications.push({
        id: `academic-exam-${record.id}-${record.exam_date}`,
        title: 'Upcoming exam reminder',
        message: `${record.exam_type} for ${record.subject_name} is ${remainingDays === 0 ? 'today' : `in ${remainingDays} day(s)`}.`,
        type: remainingDays <= 1 ? 'warning' : 'info',
        action_url: '/marks',
        action_text: 'Open marks',
      });
    });
  }

  if (preferences.notifications.gradeUpdates) {
    subjects.forEach((subject) => {
      if (isGpaGrade(subject.grade) && getGradePoints(subject.grade) === 0) {
        notifications.push({
          id: `academic-failed-course-${subject.id}`,
          title: 'Backlog planning required',
          message: `${subject.name} has an F grade and should be handled in the repeat/backlog plan.`,
          type: 'error',
          action_url: '/semesters',
          action_text: 'Review subject',
        });
      }
    });

    marks
      .filter((record) => record.total_marks > 0)
      .forEach((record) => {
        const percentage = (record.obtained_marks / record.total_marks) * 100;
        if (percentage >= 40) return;

        notifications.push({
          id: `academic-low-marks-${record.id}`,
          title: 'Low marks recorded',
          message: `${record.subject_name} ${record.exam_type} is ${percentage.toFixed(1)}%. Review the target plan.`,
          type: 'warning',
          action_url: '/marks',
          action_text: 'Open marks',
        });
      });
  }

  if (preferences.notifications.dataHealthAlerts) {
    const missingGrades = subjects.filter((subject) => !subject.grade).length;
    if (missingGrades > 0) {
      notifications.push({
        id: 'academic-missing-grades',
        title: 'Grades pending',
        message: `${missingGrades} subject${missingGrades === 1 ? ' is' : 's are'} missing final grades.`,
        type: 'info',
        action_url: '/semesters',
        action_text: 'Review subjects',
      });
    }

    const currentCgpa = typeof summary?.cgpa === 'number' && Number.isFinite(summary.cgpa)
      ? summary.cgpa
      : null;

    if (currentCgpa !== null && currentCgpa < preferences.cgpaTarget) {
      notifications.push({
        id: 'academic-cgpa-target-gap',
        title: 'CGPA target gap',
        message: `Current CGPA is ${currentCgpa.toFixed(2)} against your ${preferences.cgpaTarget.toFixed(2)} target.`,
        type: 'info',
        action_url: '/analytics',
        action_text: 'Open planner',
      });
    }
  }

  return notifications.slice(0, 40);
}
