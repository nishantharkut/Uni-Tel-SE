-- Data Integrity and Validation Constraints for UNI-TEL
-- This migration adds missing constraints and improves data integrity

-- 1) Add email validation constraint for profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 2) Add role validation constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT check_role_valid 
CHECK (role IN ('student', 'faculty', 'admin'));

-- 3) Add college name validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_college_not_empty 
CHECK (college IS NULL OR LENGTH(TRIM(college)) > 0);

-- 4) Add full name validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_full_name_not_empty 
CHECK (full_name IS NULL OR LENGTH(TRIM(full_name)) > 0));

-- 5) Add SGPA range validation
ALTER TABLE public.semesters 
ADD CONSTRAINT check_sgpa_range 
CHECK (sgpa IS NULL OR (sgpa >= 0 AND sgpa <= 10));

-- 6) Add total credits validation
ALTER TABLE public.semesters 
ADD CONSTRAINT check_total_credits_positive 
CHECK (total_credits IS NULL OR total_credits >= 0);

-- 7) Add subject name validation
ALTER TABLE public.subjects 
ADD CONSTRAINT check_subject_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);

-- 8) Add grade points validation
ALTER TABLE public.subjects 
ADD CONSTRAINT check_grade_points_range 
CHECK (grade_points IS NULL OR (grade_points >= 0 AND grade_points <= 10));

-- 9) Add consistency check between grade and grade_points
ALTER TABLE public.subjects 
ADD CONSTRAINT check_grade_grade_points_consistency 
CHECK (
  (grade IS NULL AND grade_points IS NULL) OR 
  (grade IS NOT NULL AND grade_points IS NOT NULL AND grade_points = public.grade_to_points(grade))
);

-- 10) Add subject name validation for attendance
ALTER TABLE public.attendance_records 
ADD CONSTRAINT check_attendance_subject_name_not_empty 
CHECK (LENGTH(TRIM(subject_name)) > 0);

-- 11) Add note length validation
ALTER TABLE public.attendance_records 
ADD CONSTRAINT check_note_length 
CHECK (note IS NULL OR LENGTH(note) <= 1000);

-- 12) Add subject name validation for marks
ALTER TABLE public.marks_records 
ADD CONSTRAINT check_marks_subject_name_not_empty 
CHECK (LENGTH(TRIM(subject_name)) > 0);

-- 13) Add exam type validation with more options
ALTER TABLE public.marks_records 
DROP CONSTRAINT IF EXISTS marks_records_exam_type_check;
ALTER TABLE public.marks_records 
ADD CONSTRAINT check_exam_type_valid 
CHECK (exam_type IN (
  'Quiz', 'Mid Term', 'End Term', 'Assignment', 'Lab Exam', 
  'Viva', 'Project', 'Presentation', 'Practical', 'Other'
));

-- 14) Add marks range validation
ALTER TABLE public.marks_records 
ADD CONSTRAINT check_marks_range 
CHECK (
  total_marks > 0 AND 
  obtained_marks >= 0 AND 
  obtained_marks <= total_marks
);

-- 15) Add percentage validation for marks
ALTER TABLE public.marks_records 
ADD CONSTRAINT check_marks_percentage_range 
CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100));

-- 16) Add percentage validation for attendance
ALTER TABLE public.attendance_records 
ADD CONSTRAINT check_attendance_percentage_range 
CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100));

-- 17) Add created_at validation (not in future)
ALTER TABLE public.semesters 
ADD CONSTRAINT check_created_at_not_future 
CHECK (created_at IS NULL OR created_at <= NOW());

ALTER TABLE public.subjects 
ADD CONSTRAINT check_created_at_not_future 
CHECK (created_at IS NULL OR created_at <= NOW());

ALTER TABLE public.attendance_records 
ADD CONSTRAINT check_created_at_not_future 
CHECK (created_at IS NULL OR created_at <= NOW());

ALTER TABLE public.marks_records 
ADD CONSTRAINT check_created_at_not_future 
CHECK (created_at IS NULL OR created_at <= NOW());

-- 18) Add updated_at validation (not before created_at)
ALTER TABLE public.semesters 
ADD CONSTRAINT check_updated_at_after_created_at 
CHECK (updated_at IS NULL OR created_at IS NULL OR updated_at >= created_at);

ALTER TABLE public.subjects 
ADD CONSTRAINT check_updated_at_after_created_at 
CHECK (updated_at IS NULL OR created_at IS NULL OR updated_at >= created_at);

ALTER TABLE public.attendance_records 
ADD CONSTRAINT check_updated_at_after_created_at 
CHECK (updated_at IS NULL OR created_at IS NULL OR updated_at >= created_at);

ALTER TABLE public.marks_records 
ADD CONSTRAINT check_updated_at_after_created_at 
CHECK (updated_at IS NULL OR created_at IS NULL OR updated_at >= created_at);

-- 19) Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_semesters_updated_at ON public.semesters;
CREATE TRIGGER update_semesters_updated_at
  BEFORE UPDATE ON public.semesters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance_records;
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_marks_updated_at ON public.marks_records;
CREATE TRIGGER update_marks_updated_at
  BEFORE UPDATE ON public.marks_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 20) Add function to validate academic data consistency
CREATE OR REPLACE FUNCTION public.validate_academic_data_consistency()
RETURNS TABLE (
  table_name text,
  issue_type text,
  issue_description text,
  record_id uuid
) AS $$
BEGIN
  -- Check for subjects without valid semester
  RETURN QUERY
  SELECT 
    'subjects'::text,
    'orphaned_subject'::text,
    'Subject exists without valid semester'::text,
    sub.id
  FROM public.subjects sub
  LEFT JOIN public.semesters s ON sub.semester_id = s.id
  WHERE s.id IS NULL;

  -- Check for attendance records without valid semester
  RETURN QUERY
  SELECT 
    'attendance_records'::text,
    'orphaned_attendance'::text,
    'Attendance record exists without valid semester'::text,
    att.id
  FROM public.attendance_records att
  LEFT JOIN public.semesters s ON att.semester_id = s.id
  WHERE s.id IS NULL;

  -- Check for marks records without valid semester
  RETURN QUERY
  SELECT 
    'marks_records'::text,
    'orphaned_marks'::text,
    'Marks record exists without valid semester'::text,
    mr.id
  FROM public.marks_records mr
  LEFT JOIN public.semesters s ON mr.semester_id = s.id
  WHERE s.id IS NULL;

  -- Check for subjects with invalid grade_points
  RETURN QUERY
  SELECT 
    'subjects'::text,
    'invalid_grade_points'::text,
    'Grade points do not match grade letter'::text,
    sub.id
  FROM public.subjects sub
  WHERE sub.grade IS NOT NULL 
    AND sub.grade_points IS NOT NULL 
    AND sub.grade_points != public.grade_to_points(sub.grade);

  -- Check for semesters with invalid SGPA
  RETURN QUERY
  SELECT 
    'semesters'::text,
    'invalid_sgpa'::text,
    'SGPA is outside valid range (0-10)'::text,
    s.id
  FROM public.semesters s
  WHERE s.sgpa IS NOT NULL 
    AND (s.sgpa < 0 OR s.sgpa > 10);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 21) Add function to clean up orphaned data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_academic_data()
RETURNS TABLE (
  cleaned_table text,
  records_deleted bigint
) AS $$
DECLARE
  deleted_subjects bigint;
  deleted_attendance bigint;
  deleted_marks bigint;
BEGIN
  -- Delete orphaned subjects
  DELETE FROM public.subjects 
  WHERE semester_id NOT IN (SELECT id FROM public.semesters);
  GET DIAGNOSTICS deleted_subjects = ROW_COUNT;

  -- Delete orphaned attendance records
  DELETE FROM public.attendance_records 
  WHERE semester_id NOT IN (SELECT id FROM public.semesters);
  GET DIAGNOSTICS deleted_attendance = ROW_COUNT;

  -- Delete orphaned marks records
  DELETE FROM public.marks_records 
  WHERE semester_id NOT IN (SELECT id FROM public.semesters);
  GET DIAGNOSTICS deleted_marks = ROW_COUNT;

  RETURN QUERY
  SELECT 'subjects'::text, deleted_subjects
  UNION ALL
  SELECT 'attendance_records'::text, deleted_attendance
  UNION ALL
  SELECT 'marks_records'::text, deleted_marks;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 22) Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.validate_academic_data_consistency() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_academic_data() TO authenticated;

-- 23) Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_college ON public.profiles(college) WHERE college IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_semesters_number ON public.semesters(number);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects(name);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_name ON public.attendance_records(subject_name);
CREATE INDEX IF NOT EXISTS idx_marks_subject_name ON public.marks_records(subject_name);
CREATE INDEX IF NOT EXISTS idx_marks_exam_type ON public.marks_records(exam_type);

-- 24) Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subjects_user_grade ON public.subjects(user_id, grade) WHERE grade IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_user_percentage ON public.attendance_records(user_id, percentage) WHERE percentage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marks_user_percentage ON public.marks_records(user_id, percentage) WHERE percentage IS NOT NULL;

-- 25) Add partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_backlogs ON public.subjects(user_id, semester_id) WHERE grade IN ('E', 'F', 'I');
CREATE INDEX IF NOT EXISTS idx_attendance_critical ON public.attendance_records(user_id, semester_id) WHERE percentage < 65;
CREATE INDEX IF NOT EXISTS idx_marks_excellent ON public.marks_records(user_id, semester_id) WHERE percentage >= 90;


