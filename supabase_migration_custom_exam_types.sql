-- UNI-TEL Custom Exam Types Migration
-- This allows users to create custom exam types with custom weightages

-- 1. Remove the restrictive exam_type constraint (if it exists)
-- First try to drop the named constraint from data integrity migration
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_exam_type_valid' 
    AND table_name = 'marks_records'
  ) THEN
    ALTER TABLE public.marks_records DROP CONSTRAINT check_exam_type_valid;
  END IF;
END $$;

-- Also try to drop any system-generated constraints on exam_type
DO $$ 
DECLARE
  constraint_name text;
BEGIN
  -- Find and drop any CHECK constraint on exam_type column
  FOR constraint_name IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.marks_records'::regclass 
    AND contype = 'c'
    AND conname LIKE '%exam_type%'
  LOOP
    EXECUTE 'ALTER TABLE public.marks_records DROP CONSTRAINT ' || constraint_name;
  END LOOP;
END $$;

-- 2. Add weightage column to marks_records
ALTER TABLE public.marks_records 
ADD COLUMN IF NOT EXISTS weightage numeric(5,2) DEFAULT 100.00;

-- 3. Add custom exam type validation (allow any text, but with reasonable length)
ALTER TABLE public.marks_records 
ADD CONSTRAINT check_exam_type_length CHECK (
  length(trim(exam_type)) >= 1 AND length(trim(exam_type)) <= 50
);

-- 4. Add weightage validation (0-100%)
ALTER TABLE public.marks_records 
ADD CONSTRAINT check_weightage_range CHECK (
  weightage >= 0 AND weightage <= 100
);

-- 5. Add weighted percentage calculation
-- This will calculate the weighted percentage based on the exam's weightage
ALTER TABLE public.marks_records 
ADD COLUMN IF NOT EXISTS weighted_percentage numeric(5,2) GENERATED ALWAYS AS (
  ROUND((percentage * weightage / 100), 2)
) STORED;

-- 6. Create a function to get subject-wise weighted average
CREATE OR REPLACE FUNCTION public.get_subject_weighted_average(
  p_user_id uuid,
  p_semester_id uuid,
  p_subject_name text
)
RETURNS numeric AS $$
DECLARE
  weighted_sum numeric := 0;
  total_weight numeric := 0;
  result numeric;
BEGIN
  SELECT 
    COALESCE(SUM(percentage * weightage), 0),
    COALESCE(SUM(weightage), 0)
  INTO weighted_sum, total_weight
  FROM public.marks_records
  WHERE user_id = p_user_id 
    AND semester_id = p_semester_id 
    AND subject_name = p_subject_name;
  
  IF total_weight > 0 THEN
    result := ROUND(weighted_sum / total_weight, 2);
  ELSE
    result := NULL;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 7. Create a function to get semester weighted average
CREATE OR REPLACE FUNCTION public.get_semester_weighted_average(
  p_user_id uuid,
  p_semester_id uuid
)
RETURNS numeric AS $$
DECLARE
  weighted_sum numeric := 0;
  total_weight numeric := 0;
  result numeric;
BEGIN
  SELECT 
    COALESCE(SUM(percentage * weightage), 0),
    COALESCE(SUM(weightage), 0)
  INTO weighted_sum, total_weight
  FROM public.marks_records
  WHERE user_id = p_user_id 
    AND semester_id = p_semester_id;
  
  IF total_weight > 0 THEN
    result := ROUND(weighted_sum / total_weight, 2);
  ELSE
    result := NULL;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 8. Create a view for custom exam types used by user
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

-- 9. Create a view for subject-wise weighted performance
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

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_subject_weighted_average(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_semester_weighted_average(uuid, uuid) TO authenticated;

-- 11. Enable RLS on new views
ALTER VIEW public.user_custom_exam_types SET (security_invoker = true);
ALTER VIEW public.subject_weighted_performance SET (security_invoker = true);

-- 12. Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_marks_weightage ON public.marks_records(weightage);
CREATE INDEX IF NOT EXISTS idx_marks_weighted_percentage ON public.marks_records(weighted_percentage);
CREATE INDEX IF NOT EXISTS idx_marks_user_exam_type ON public.marks_records(user_id, exam_type);
