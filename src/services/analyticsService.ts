import { supabase } from '@/integrations/supabase/client';

// Analytics interfaces
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

// Analytics service
export const analyticsService = {
  // Get semester-wise performance trends
  async getSemesterPerformanceTrends(): Promise<SemesterPerformanceTrend[]> {
    const { data, error } = await supabase
      .rpc('get_semester_performance_trends');
    if (error) throw error;
    return data || [];
  },

  // Get grade distribution analytics
  async getGradeDistributionAnalytics(): Promise<GradeDistributionAnalytics[]> {
    const { data, error } = await supabase
      .rpc('get_grade_distribution_analytics');
    if (error) throw error;
    return data || [];
  },

  // Get attendance analytics
  async getAttendanceAnalytics(): Promise<AttendanceAnalytics | null> {
    const { data, error } = await supabase
      .rpc('get_attendance_analytics');
    if (error) throw error;
    return data?.[0] || null;
  },

  // Get marks performance analytics
  async getMarksPerformanceAnalytics(): Promise<MarksPerformanceAnalytics | null> {
    const { data, error } = await supabase
      .rpc('get_marks_performance_analytics');
    if (error) throw error;
    return data?.[0] || null;
  },

  // Get academic achievements
  async getAcademicAchievements(): Promise<AcademicAchievement[]> {
    const { data, error } = await supabase
      .rpc('get_academic_achievements');
    if (error) throw error;
    return data || [];
  },

  // Get comprehensive analytics dashboard data
  async getDashboardAnalytics() {
    const [
      semesterTrends,
      gradeDistribution,
      attendanceAnalytics,
      marksAnalytics,
      achievements
    ] = await Promise.all([
      this.getSemesterPerformanceTrends(),
      this.getGradeDistributionAnalytics(),
      this.getAttendanceAnalytics(),
      this.getMarksPerformanceAnalytics(),
      this.getAcademicAchievements()
    ]);

    return {
      semesterTrends,
      gradeDistribution,
      attendanceAnalytics,
      marksAnalytics,
      achievements
    };
  }
};