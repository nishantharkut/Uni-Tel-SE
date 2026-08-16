-- Fix SGPA and CGPA calculations to match official formula
-- Official Formula:
-- SGPA = (Σ c_i * p_i) / (Σ c_i) where only subjects with valid grades are included
-- CGPA = (Σ c_j * p_j) / (Σ c_j) where all subjects across all semesters with valid grades are included

-- 1) Fix SGPA calculation to only include subjects with valid grades
CREATE OR REPLACE FUNCTION public.recalculate_semester_sgpa_for(sem_id uuid, usr_id uuid)
RETURNS void AS $$
DECLARE
  total_credits_sum integer;
  weighted_points numeric;
  calculated_sgpa numeric;
BEGIN
  -- Only include subjects with valid grades (as mentioned in Table 1)
  -- E, F, I are valid grades with 0 points and should be included
  SELECT 
    COALESCE(SUM(credits), 0),
    COALESCE(SUM(credits * COALESCE(grade_points, 0)), 0)
  INTO total_credits_sum, weighted_points
  FROM public.subjects
  WHERE semester_id = sem_id 
    AND user_id = usr_id
    AND grade IS NOT NULL
    AND grade IN ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'F', 'I');

  IF total_credits_sum > 0 THEN
    calculated_sgpa := ROUND(weighted_points / total_credits_sum, 2);
  ELSE
    calculated_sgpa := NULL;
  END IF;

  UPDATE public.semesters
  SET total_credits = total_credits_sum,
      sgpa = calculated_sgpa,
      updated_at = now()
  WHERE id = sem_id;
END;
$$ LANGUAGE plpgsql;

-- 2) Fix CGPA calculation to calculate directly from all subjects (not from SGPA values)
CREATE OR REPLACE FUNCTION public.get_user_cgpa(target_user_id uuid)
RETURNS numeric AS $$
DECLARE
  total_weighted_points numeric := 0;
  total_credits_sum numeric := 0;
  calculated_cgpa numeric;
BEGIN
  -- Calculate CGPA directly from all subjects across all semesters
  -- Official formula: CGPA = (Σ c_j * p_j) / (Σ c_j)
  -- Only include subjects with valid grades (as mentioned in Table 1)
  -- E, F, I are valid grades with 0 points and should be included
  SELECT 
    COALESCE(SUM(credits * COALESCE(grade_points, 0)), 0),
    COALESCE(SUM(credits), 0)
  INTO total_weighted_points, total_credits_sum
  FROM public.subjects
  WHERE user_id = target_user_id
    AND grade IS NOT NULL
    AND grade IN ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'F', 'I');

  IF total_credits_sum > 0 THEN
    calculated_cgpa := ROUND(total_weighted_points / total_credits_sum, 2);
  ELSE
    calculated_cgpa := NULL;
  END IF;

  RETURN calculated_cgpa;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

