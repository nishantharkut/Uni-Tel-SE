import {
  attendanceService,
  marksService,
  semesterService,
  subjectService,
  type AttendanceRecord,
  type MarksRecord,
  type Semester,
  type Subject,
} from '@/services/academicService';
import {
  calculateAcademicAchievements,
  calculateAttendanceAnalytics,
  calculateGradeDistributionAnalytics,
  calculateMarksPerformanceAnalytics,
  calculateSemesterPerformanceTrends,
  type AcademicAchievement,
  type AttendanceAnalytics,
  type GradeDistributionAnalytics,
  type MarksPerformanceAnalytics,
  type SemesterPerformanceTrend,
} from '@/domain/analyticsCalculations';

export type {
  AcademicAchievement,
  AttendanceAnalytics,
  GradeDistributionAnalytics,
  MarksPerformanceAnalytics,
  SemesterPerformanceTrend,
};

interface AnalyticsSourceData {
  semesters: Semester[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
}

async function loadAnalyticsSourceData(): Promise<AnalyticsSourceData> {
  const [semesters, subjects, attendance, marks] = await Promise.all([
    semesterService.getAll(),
    subjectService.getAll(),
    attendanceService.getAll(),
    marksService.getAll(),
  ]);

  return {
    semesters: semesters as Semester[],
    subjects: subjects as Subject[],
    attendance: attendance as AttendanceRecord[],
    marks: marks as MarksRecord[],
  };
}

export const analyticsService = {
  async getSemesterPerformanceTrends(): Promise<SemesterPerformanceTrend[]> {
    const { semesters, subjects, attendance, marks } = await loadAnalyticsSourceData();
    return calculateSemesterPerformanceTrends(semesters, subjects, attendance, marks);
  },

  async getGradeDistributionAnalytics(): Promise<GradeDistributionAnalytics[]> {
    const subjects = await subjectService.getAll();
    return calculateGradeDistributionAnalytics(subjects as Subject[]);
  },

  async getAttendanceAnalytics(): Promise<AttendanceAnalytics | null> {
    const attendance = await attendanceService.getAll();
    return calculateAttendanceAnalytics(attendance as AttendanceRecord[]);
  },

  async getMarksPerformanceAnalytics(): Promise<MarksPerformanceAnalytics | null> {
    const marks = await marksService.getAll();
    return calculateMarksPerformanceAnalytics(marks as MarksRecord[]);
  },

  async getAcademicAchievements(): Promise<AcademicAchievement[]> {
    const [subjects, attendance, marks] = await Promise.all([
      subjectService.getAll(),
      attendanceService.getAll(),
      marksService.getAll(),
    ]);

    return calculateAcademicAchievements(
      subjects as Subject[],
      attendance as AttendanceRecord[],
      marks as MarksRecord[]
    );
  },

  async getDashboardAnalytics() {
    const { semesters, subjects, attendance, marks } = await loadAnalyticsSourceData();

    return {
      semesterTrends: calculateSemesterPerformanceTrends(semesters, subjects, attendance, marks),
      gradeDistribution: calculateGradeDistributionAnalytics(subjects),
      attendanceAnalytics: calculateAttendanceAnalytics(attendance),
      marksAnalytics: calculateMarksPerformanceAnalytics(marks),
      achievements: calculateAcademicAchievements(subjects, attendance, marks),
    };
  },
};
