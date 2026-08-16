-- Migration: Add exam_date, exam_time, and weightage columns to marks_records
-- Also update constraints to allow optional marks (total_marks and obtained_marks can be 0)

-- 1) Add weightage column if it doesn't exist
ALTER TABLE public.marks_records 
ADD COLUMN IF NOT EXISTS weightage numeric(5,2) DEFAULT 100 CHECK (weightage >= 0 AND weightage <= 100);

-- 2) Add exam_date column (nullable, for scheduling exams before they happen)
ALTER TABLE public.marks_records 
ADD COLUMN IF NOT EXISTS exam_date date;

-- 3) Add exam_time column (nullable, for scheduling exam time)
ALTER TABLE public.marks_records 
ADD COLUMN IF NOT EXISTS exam_time time;

-- 4) Update constraints to allow total_marks and obtained_marks to be 0 (optional marks)
-- First, drop the existing constraint that requires total_marks > 0
ALTER TABLE public.marks_records 
DROP CONSTRAINT IF EXISTS marks_records_total_marks_check;

-- Add new constraint that allows 0 (for optional marks)
ALTER TABLE public.marks_records 
ADD CONSTRAINT check_total_marks_non_negative 
CHECK (total_marks >= 0);

-- 5) Update the percentage generated column to handle division by zero
-- IMPORTANT: This drops and recreates the percentage column, which triggers a warning.
-- This is SAFE because:
-- 1. percentage is a GENERATED (computed) column - it contains no stored data
-- 2. All values will be automatically recalculated when the column is recreated
-- 3. No data loss occurs - it's just a formula that gets reapplied
-- 
-- Note: We cannot directly modify a GENERATED column in PostgreSQL,
-- so dropping and recreating is the only way to update its definition.

-- First, drop dependent views that use the percentage column
-- These views will be recreated after the percentage column is updated
DROP VIEW IF EXISTS public.user_custom_exam_types CASCADE;
DROP VIEW IF EXISTS public.subject_weighted_performance CASCADE;

-- Check if percentage column exists and needs updating (only if it doesn't handle 0 values)
-- For safety, we'll always update it to ensure it handles division by zero correctly
DO $$ 
BEGIN
  -- Drop the existing percentage column if it exists
  -- This is safe because it's a computed column with no stored data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marks_records' 
    AND column_name = 'percentage'
  ) THEN
    -- Drop the column - this is safe for GENERATED columns
    ALTER TABLE public.marks_records DROP COLUMN percentage;
  END IF;
END $$;

-- Recreate it with proper null handling for division by zero
-- This will automatically recalculate all percentage values from existing marks
ALTER TABLE public.marks_records 
ADD COLUMN percentage numeric(5,2) GENERATED ALWAYS AS (
  CASE 
    WHEN total_marks > 0 THEN
      ROUND((obtained_marks::numeric / total_marks::numeric) * 100, 2)
    ELSE NULL  -- Returns NULL when total_marks = 0 (optional marks)
  END
) STORED;

-- Recreate the views that depend on the percentage column
-- Note: These views reference weightage, which should exist by now (added in step 1)
CREATE OR REPLACE VIEW public.user_custom_exam_types AS
SELECT 
  user_id,
  exam_type,
  COUNT(*) as usage_count,
  AVG(weightage) as avg_weightage,
  MIN(weightage) as min_weightage,
  MAX(weightage) as max_weightage,
  AVG(percentage) as avg_performance
FROM public.marks_records
WHERE user_id = auth.uid()
GROUP BY user_id, exam_type
ORDER BY usage_count DESC, exam_type;

CREATE OR REPLACE VIEW public.subject_weighted_performance AS
SELECT 
  mr.user_id,
  mr.semester_id,
  s.number as semester_number,
  mr.subject_name,
  COUNT(*) as total_exams,
  SUM(mr.weightage) as total_weight,
  public.get_subject_weighted_average(mr.user_id, mr.semester_id, mr.subject_name) as weighted_average,
  AVG(mr.percentage) as simple_average,
  MAX(mr.percentage) as best_performance,
  MIN(mr.percentage) as worst_performance
FROM public.marks_records mr
JOIN public.semesters s ON mr.semester_id = s.id
WHERE mr.user_id = auth.uid()
GROUP BY mr.user_id, mr.semester_id, s.number, mr.subject_name
ORDER BY s.number, mr.subject_name;

-- Re-enable security invoker on views
ALTER VIEW public.user_custom_exam_types SET (security_invoker = true);
ALTER VIEW public.subject_weighted_performance SET (security_invoker = true);

-- 6) Add weighted_percentage column (calculated field) - must be after percentage is recreated
ALTER TABLE public.marks_records 
ADD COLUMN IF NOT EXISTS weighted_percentage numeric(5,2) GENERATED ALWAYS AS (
  CASE 
    WHEN percentage IS NOT NULL AND weightage IS NOT NULL THEN
      ROUND((percentage * weightage / 100), 2)
    ELSE NULL
  END
) STORED;

-- 7) Update the check constraint for obtained_marks vs total_marks to handle 0 values
ALTER TABLE public.marks_records 
DROP CONSTRAINT IF EXISTS marks_records_obtained_marks_check;

ALTER TABLE public.marks_records 
ADD CONSTRAINT check_obtained_marks_non_negative 
CHECK (obtained_marks >= 0);

-- Update the combined check constraint
ALTER TABLE public.marks_records 
DROP CONSTRAINT IF EXISTS marks_records_check;

ALTER TABLE public.marks_records 
ADD CONSTRAINT check_marks_valid 
CHECK (
  (total_marks = 0 AND obtained_marks = 0) OR 
  (total_marks > 0 AND obtained_marks >= 0 AND obtained_marks <= total_marks)
);

-- 8) Update the marks_range constraint if it exists
ALTER TABLE public.marks_records 
DROP CONSTRAINT IF EXISTS check_marks_range;

ALTER TABLE public.marks_records 
ADD CONSTRAINT check_marks_range 
CHECK (
  total_marks >= 0 AND 
  obtained_marks >= 0 AND 
  (total_marks = 0 OR obtained_marks <= total_marks)
);

-- 9) Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_marks_exam_date ON public.marks_records(exam_date) WHERE exam_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marks_weightage ON public.marks_records(weightage) WHERE weightage IS NOT NULL;

-- 10) Add comment for documentation
COMMENT ON COLUMN public.marks_records.weightage IS 'Weightage percentage (0-100) for this exam in the overall subject grade';
COMMENT ON COLUMN public.marks_records.exam_date IS 'Scheduled date for the exam (nullable, can be set before exam is taken)';
COMMENT ON COLUMN public.marks_records.exam_time IS 'Scheduled time for the exam (nullable)';
COMMENT ON COLUMN public.marks_records.weighted_percentage IS 'Calculated weighted percentage (percentage * weightage / 100)';

