-- Migration: Fix division by zero in weighted_percentage column
-- This migration ensures that weighted_percentage properly handles cases where total_marks = 0
-- by dropping and recreating the column with the correct definition

-- Drop dependent views that use the weighted_percentage and percentage columns
DROP VIEW IF EXISTS public.user_custom_exam_types CASCADE;
DROP VIEW IF EXISTS public.subject_weighted_performance CASCADE;

-- Step 1: First, ensure percentage column handles division by zero correctly
-- Drop and recreate percentage column if it doesn't already handle 0 values
DO $$ 
BEGIN
  -- Check if percentage column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marks_records' 
    AND column_name = 'percentage'
  ) THEN
    -- Drop the column - this is safe for GENERATED columns (no stored data)
    ALTER TABLE public.marks_records DROP COLUMN percentage;
    
    -- Recreate with proper null handling for division by zero
    ALTER TABLE public.marks_records 
    ADD COLUMN percentage numeric(5,2) GENERATED ALWAYS AS (
      CASE 
        WHEN total_marks > 0 THEN
          ROUND((obtained_marks::numeric / total_marks::numeric) * 100, 2)
        ELSE NULL  -- Returns NULL when total_marks = 0 (optional marks)
      END
    ) STORED;
  END IF;
END $$;

-- Step 2: Drop the existing weighted_percentage column if it exists
-- This must be done AFTER percentage is recreated, as weighted_percentage depends on percentage
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marks_records' 
    AND column_name = 'weighted_percentage'
  ) THEN
    -- Drop the column - this is safe for GENERATED columns (no stored data)
    ALTER TABLE public.marks_records DROP COLUMN weighted_percentage;
  END IF;
END $$;

-- Step 3: Recreate weighted_percentage with proper null handling
-- It should be NULL when total_marks = 0 (cannot reference percentage as it's also a generated column)
-- Calculate directly from base columns: (obtained_marks / total_marks * 100) * weightage / 100
ALTER TABLE public.marks_records 
ADD COLUMN weighted_percentage numeric(5,2) GENERATED ALWAYS AS (
  CASE 
    WHEN total_marks > 0 AND weightage IS NOT NULL THEN
      ROUND(((obtained_marks::numeric / total_marks::numeric) * 100 * weightage / 100), 2)
    ELSE NULL
  END
) STORED;

-- Recreate the views that depend on the percentage and weighted_percentage columns
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

-- Add comment for documentation
COMMENT ON COLUMN public.marks_records.weighted_percentage IS 'Calculated weighted percentage ((obtained_marks / total_marks * 100) * weightage / 100). NULL when total_marks = 0.';
COMMENT ON COLUMN public.marks_records.percentage IS 'Calculated percentage (obtained_marks / total_marks * 100). NULL when total_marks = 0.';

