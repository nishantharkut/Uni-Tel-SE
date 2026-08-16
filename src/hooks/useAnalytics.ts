import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

// Semester performance trends
export const useSemesterPerformanceTrends = () => {
  return useQuery({
    queryKey: ['analytics', 'semester-trends'],
    queryFn: analyticsService.getSemesterPerformanceTrends,
  });
};

// Grade distribution analytics
export const useGradeDistributionAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'grade-distribution'],
    queryFn: analyticsService.getGradeDistributionAnalytics,
  });
};

// Attendance analytics
export const useAttendanceAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'attendance'],
    queryFn: analyticsService.getAttendanceAnalytics,
  });
};

// Marks performance analytics
export const useMarksPerformanceAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'marks-performance'],
    queryFn: analyticsService.getMarksPerformanceAnalytics,
  });
};

// Academic achievements
export const useAcademicAchievements = () => {
  return useQuery({
    queryKey: ['analytics', 'achievements'],
    queryFn: analyticsService.getAcademicAchievements,
  });
};

// Comprehensive dashboard analytics
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsService.getDashboardAnalytics,
  });
};