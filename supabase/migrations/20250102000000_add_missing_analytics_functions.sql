-- Additional Analytics and Reporting Functions for UNI-TEL
-- This migration adds missing database functions for comprehensive analytics

-- 1) Function to get semester-wise performance trends
CREATE OR REPLACE FUNCTION public.get_semester_performance_trends()
RETURNS TABLE (
  semester_number integer,
  sgpa numeric,
  total_credits integer,
  subjects_count bigint,
  average_attendance numeric,
  total_marks_records bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.number as semester_number,
    s.sgpa,
    s.total_credits,
    COUNT(DISTINCT sub.id) as subjects_count,
    COALESCE(AVG(att.percentage), 0) as average_attendance,
    COUNT(DISTINCT mr.id) as total_marks_records
  FROM public.semesters s
  LEFT JOIN public.subjects sub ON s.id = sub.semester_id
  LEFT JOIN public.attendance_records att ON s.id = att.semester_id
  LEFT JOIN public.marks_records mr ON s.id = mr.semester_id
  WHERE s.user_id = auth.uid()
  GROUP BY s.id, s.number, s.sgpa, s.total_credits
  ORDER BY s.number;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 2) Function to get grade distribution analytics
CREATE OR REPLACE FUNCTION public.get_grade_distribution_analytics()
RETURNS TABLE (
  grade text,
  count bigint,
  percentage numeric,
  total_credits bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sub.grade,
    COUNT(*) as count,
    ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.subjects WHERE user_id = auth.uid() AND grade IS NOT NULL)) * 100, 2) as percentage,
    SUM(sub.credits) as total_credits
  FROM public.subjects sub
  WHERE sub.user_id = auth.uid() AND sub.grade IS NOT NULL
  GROUP BY sub.grade
  ORDER BY 
    CASE sub.grade
      WHEN 'A' THEN 1
      WHEN 'A-' THEN 2
      WHEN 'B' THEN 3
      WHEN 'B-' THEN 4
      WHEN 'C' THEN 5
      WHEN 'C-' THEN 6
      WHEN 'D' THEN 7
      WHEN 'E' THEN 8
      WHEN 'F' THEN 9
      WHEN 'I' THEN 10
    END;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 3) Function to get attendance analytics
CREATE OR REPLACE FUNCTION public.get_attendance_analytics()
RETURNS TABLE (
  total_subjects bigint,
  average_attendance numeric,
  good_attendance_count bigint,
  poor_attendance_count bigint,
  critical_attendance_count bigint,
  attendance_trend numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT att.subject_name) as total_subjects,
    COALESCE(AVG(att.percentage), 0) as average_attendance,
    COUNT(CASE WHEN att.percentage >= 75 THEN 1 END) as good_attendance_count,
    COUNT(CASE WHEN att.percentage BETWEEN 65 AND 74.99 THEN 1 END) as poor_attendance_count,
    COUNT(CASE WHEN att.percentage < 65 THEN 1 END) as critical_attendance_count,
    COALESCE(
      (SELECT AVG(att2.percentage) 
       FROM public.attendance_records att2 
       WHERE att2.user_id = auth.uid() 
       AND att2.created_at >= NOW() - INTERVAL '30 days'
      ) - 
      (SELECT AVG(att3.percentage) 
       FROM public.attendance_records att3 
       WHERE att3.user_id = auth.uid() 
       AND att3.created_at < NOW() - INTERVAL '30 days'
      ), 0
    ) as attendance_trend
  FROM public.attendance_records att
  WHERE att.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 4) Function to get marks performance analytics
CREATE OR REPLACE FUNCTION public.get_marks_performance_analytics()
RETURNS TABLE (
  total_exams bigint,
  average_percentage numeric,
  excellent_performance_count bigint,
  good_performance_count bigint,
  average_performance_count bigint,
  poor_performance_count bigint,
  performance_trend numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_exams,
    COALESCE(AVG(mr.percentage), 0) as average_percentage,
    COUNT(CASE WHEN mr.percentage >= 90 THEN 1 END) as excellent_performance_count,
    COUNT(CASE WHEN mr.percentage BETWEEN 80 AND 89.99 THEN 1 END) as good_performance_count,
    COUNT(CASE WHEN mr.percentage BETWEEN 70 AND 79.99 THEN 1 END) as average_performance_count,
    COUNT(CASE WHEN mr.percentage < 70 THEN 1 END) as poor_performance_count,
    COALESCE(
      (SELECT AVG(mr2.percentage) 
       FROM public.marks_records mr2 
       WHERE mr2.user_id = auth.uid() 
       AND mr2.created_at >= NOW() - INTERVAL '30 days'
      ) - 
      (SELECT AVG(mr3.percentage) 
       FROM public.marks_records mr3 
       WHERE mr3.user_id = auth.uid() 
       AND mr3.created_at < NOW() - INTERVAL '30 days'
      ), 0
    ) as performance_trend
  FROM public.marks_records mr
  WHERE mr.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 5) Function to get subject-wise performance
CREATE OR REPLACE FUNCTION public.get_subject_performance_analytics()
RETURNS TABLE (
  subject_name text,
  semester_number integer,
  grade text,
  credits integer,
  attendance_percentage numeric,
  average_marks_percentage numeric,
  total_exams bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sub.name as subject_name,
    s.number as semester_number,
    sub.grade,
    sub.credits,
    COALESCE(att.percentage, 0) as attendance_percentage,
    COALESCE(AVG(mr.percentage), 0) as average_marks_percentage,
    COUNT(mr.id) as total_exams
  FROM public.subjects sub
  JOIN public.semesters s ON sub.semester_id = s.id
  LEFT JOIN public.attendance_records att ON sub.semester_id = att.semester_id AND sub.name = att.subject_name
  LEFT JOIN public.marks_records mr ON sub.semester_id = mr.semester_id AND sub.name = mr.subject_name
  WHERE sub.user_id = auth.uid()
  GROUP BY sub.id, sub.name, s.number, sub.grade, sub.credits, att.percentage
  ORDER BY s.number, sub.name;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 6) Function to get academic milestones and achievements
CREATE OR REPLACE FUNCTION public.get_academic_achievements()
RETURNS TABLE (
  achievement_type text,
  achievement_description text,
  achieved boolean,
  progress_percentage numeric,
  target_value numeric,
  current_value numeric
) AS $$
DECLARE
  user_cgpa numeric;
  total_semesters bigint;
  total_credits bigint;
  backlogs_count bigint;
BEGIN
  -- Get current academic stats
  SELECT 
    public.get_user_cgpa(auth.uid()),
    COUNT(*),
    COALESCE(SUM(total_credits), 0),
    COUNT(CASE WHEN sub.grade IN ('E', 'F', 'I') THEN 1 END)
  INTO user_cgpa, total_semesters, total_credits, backlogs_count
  FROM public.semesters s
  LEFT JOIN public.subjects sub ON s.id = sub.semester_id
  WHERE s.user_id = auth.uid();

  -- Return achievement data
  RETURN QUERY
  SELECT 
    'CGPA Excellence'::text,
    'Maintain CGPA above 8.0'::text,
    (user_cgpa >= 8.0),
    CASE WHEN user_cgpa IS NOT NULL THEN LEAST((user_cgpa / 8.0) * 100, 100) ELSE 0 END,
    8.0,
    COALESCE(user_cgpa, 0)
  UNION ALL
  SELECT 
    'Semester Completion'::text,
    'Complete 8 semesters'::text,
    (total_semesters >= 8),
    LEAST((total_semesters::numeric / 8) * 100, 100),
    8.0,
    total_semesters::numeric
  UNION ALL
  SELECT 
    'Credit Accumulation'::text,
    'Earn 160 credits'::text,
    (total_credits >= 160),
    LEAST((total_credits::numeric / 160) * 100, 100),
    160.0,
    total_credits::numeric
  UNION ALL
  SELECT 
    'Backlog Clearance'::text,
    'Clear all backlogs'::text,
    (backlogs_count = 0),
    CASE WHEN backlogs_count = 0 THEN 100 ELSE 0 END,
    0.0,
    backlogs_count::numeric;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 7) Function to get performance insights and recommendations
CREATE OR REPLACE FUNCTION public.get_performance_insights()
RETURNS TABLE (
  insight_type text,
  insight_title text,
  insight_description text,
  priority text,
  actionable boolean
) AS $$
DECLARE
  user_cgpa numeric;
  avg_attendance numeric;
  backlogs_count bigint;
  recent_performance_trend numeric;
BEGIN
  -- Get key metrics
  SELECT 
    public.get_user_cgpa(auth.uid()),
    COALESCE(AVG(att.percentage), 0),
    COUNT(CASE WHEN sub.grade IN ('E', 'F', 'I') THEN 1 END)
  INTO user_cgpa, avg_attendance, backlogs_count
  FROM public.semesters s
  LEFT JOIN public.subjects sub ON s.id = sub.semester_id
  LEFT JOIN public.attendance_records att ON s.id = att.semester_id
  WHERE s.user_id = auth.uid();

  -- Calculate recent performance trend
  SELECT 
    COALESCE(
      (SELECT AVG(s2.sgpa) FROM public.semesters s2 
       WHERE s2.user_id = auth.uid() 
       AND s2.number >= (SELECT MAX(number) - 2 FROM public.semesters WHERE user_id = auth.uid())
      ) - 
      (SELECT AVG(s3.sgpa) FROM public.semesters s3 
       WHERE s3.user_id = auth.uid() 
       AND s3.number < (SELECT MAX(number) - 2 FROM public.semesters WHERE user_id = auth.uid())
      ), 0
    )
  INTO recent_performance_trend;

  -- Return insights based on data
  RETURN QUERY
  -- CGPA insights
  SELECT 
    'Performance'::text,
    CASE 
      WHEN user_cgpa IS NULL THEN 'Start Adding Grades'
      WHEN user_cgpa >= 8.5 THEN 'Excellent Performance!'
      WHEN user_cgpa >= 7.0 THEN 'Good Performance'
      WHEN user_cgpa >= 6.0 THEN 'Average Performance'
      ELSE 'Needs Improvement'
    END,
    CASE 
      WHEN user_cgpa IS NULL THEN 'Add your semester grades to track your CGPA'
      WHEN user_cgpa >= 8.5 THEN 'Keep up the excellent work!'
      WHEN user_cgpa >= 7.0 THEN 'You are doing well, aim for 8.0+'
      WHEN user_cgpa >= 6.0 THEN 'Focus on improving grades in upcoming semesters'
      ELSE 'Consider seeking academic support and improving study habits'
    END,
    CASE 
      WHEN user_cgpa IS NULL THEN 'Low'
      WHEN user_cgpa >= 8.0 THEN 'Low'
      WHEN user_cgpa >= 6.0 THEN 'Medium'
      ELSE 'High'
    END,
    (user_cgpa IS NOT NULL)
  UNION ALL
  -- Attendance insights
  SELECT 
    'Attendance'::text,
    CASE 
      WHEN avg_attendance >= 85 THEN 'Great Attendance!'
      WHEN avg_attendance >= 75 THEN 'Good Attendance'
      WHEN avg_attendance >= 65 THEN 'Attendance Warning'
      ELSE 'Critical Attendance'
    END,
    CASE 
      WHEN avg_attendance >= 85 THEN 'Maintain your excellent attendance record'
      WHEN avg_attendance >= 75 THEN 'Keep up the good attendance'
      WHEN avg_attendance >= 65 THEN 'Try to improve attendance to avoid issues'
      ELSE 'Urgent: Improve attendance to avoid academic penalties'
    END,
    CASE 
      WHEN avg_attendance >= 75 THEN 'Low'
      WHEN avg_attendance >= 65 THEN 'Medium'
      ELSE 'High'
    END,
    true
  UNION ALL
  -- Backlog insights
  SELECT 
    'Backlogs'::text,
    CASE 
      WHEN backlogs_count = 0 THEN 'No Backlogs!'
      WHEN backlogs_count <= 2 THEN 'Few Backlogs'
      ELSE 'Multiple Backlogs'
    END,
    CASE 
      WHEN backlogs_count = 0 THEN 'Excellent! No backlogs to clear'
      WHEN backlogs_count <= 2 THEN 'Focus on clearing these backlogs soon'
      ELSE 'Priority: Clear backlogs to maintain academic progress'
    END,
    CASE 
      WHEN backlogs_count = 0 THEN 'Low'
      WHEN backlogs_count <= 2 THEN 'Medium'
      ELSE 'High'
    END,
    true
  UNION ALL
  -- Performance trend insights
  SELECT 
    'Trend'::text,
    CASE 
      WHEN recent_performance_trend > 0.5 THEN 'Improving Performance'
      WHEN recent_performance_trend > -0.5 THEN 'Stable Performance'
      ELSE 'Declining Performance'
    END,
    CASE 
      WHEN recent_performance_trend > 0.5 THEN 'Great! Your performance is improving'
      WHEN recent_performance_trend > -0.5 THEN 'Your performance is stable'
      ELSE 'Consider reviewing study strategies and seeking help'
    END,
    CASE 
      WHEN recent_performance_trend >= 0 THEN 'Low'
      ELSE 'Medium'
    END,
    true;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 8) Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.get_semester_performance_trends() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_grade_distribution_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_attendance_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_marks_performance_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subject_performance_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_academic_achievements() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_insights() TO authenticated;

-- 9) Create indexes for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_attendance_percentage ON public.attendance_records(percentage) WHERE percentage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marks_percentage ON public.marks_records(percentage) WHERE percentage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subjects_grade_points ON public.subjects(grade_points) WHERE grade_points IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_semesters_sgpa ON public.semesters(sgpa) WHERE sgpa IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON public.attendance_records(created_at);
CREATE INDEX IF NOT EXISTS idx_marks_created_at ON public.marks_records(created_at);

-- 10) Add computed columns for better analytics
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS is_backlog boolean GENERATED ALWAYS AS (grade IN ('E', 'F', 'I')) STORED;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS is_critical boolean GENERATED ALWAYS AS (percentage < 65) STORED;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS is_warning boolean GENERATED ALWAYS AS (percentage BETWEEN 65 AND 74.99) STORED;
ALTER TABLE public.marks_records ADD COLUMN IF NOT EXISTS is_excellent boolean GENERATED ALWAYS AS (percentage >= 90) STORED;
ALTER TABLE public.marks_records ADD COLUMN IF NOT EXISTS is_poor boolean GENERATED ALWAYS AS (percentage < 70) STORED;


