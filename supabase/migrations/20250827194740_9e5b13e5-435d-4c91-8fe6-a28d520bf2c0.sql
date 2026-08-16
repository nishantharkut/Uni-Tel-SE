
-- Updated UNI-TEL Academic Migration with fixes
-- This addresses the issues with profiles duplication, SGPA recalculation, and view security

-- 1) Create normalized profiles table with user_id as primary key
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  college text,
  role text NOT NULL DEFAULT 'student',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Create semesters table
CREATE TABLE IF NOT EXISTS public.semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number integer NOT NULL CHECK (number >= 1 AND number <= 12),
  sgpa numeric(4,2),
  total_credits integer DEFAULT 0,
  source_json_import boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, number)
);

-- 3) Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_id uuid NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name text NOT NULL,
  credits integer NOT NULL CHECK (credits BETWEEN 1 AND 6),
  grade text CHECK (grade IN ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E', 'F', 'I')),
  grade_points numeric(3,1),
  source_json_import boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, semester_id, name)
);

-- 4) Create attendance records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_id uuid NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  total_classes integer DEFAULT 0 CHECK (total_classes >= 0),
  attended_classes integer DEFAULT 0 CHECK (attended_classes >= 0),
  percentage numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_classes > 0 THEN 
        ROUND((attended_classes::numeric / total_classes::numeric) * 100, 2)
      ELSE 0 
    END
  ) STORED,
  note text,
  source_json_import boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, semester_id, subject_name),
  CHECK (attended_classes <= total_classes)
);

-- 5) Create marks records table
CREATE TABLE IF NOT EXISTS public.marks_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_id uuid NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  exam_type text NOT NULL CHECK (exam_type IN ('Quiz', 'Mid', 'End', 'Assignment', 'Lab', 'Project', 'Other')),
  total_marks integer NOT NULL CHECK (total_marks > 0),
  obtained_marks integer NOT NULL CHECK (obtained_marks >= 0),
  percentage numeric(5,2) GENERATED ALWAYS AS (
    ROUND((obtained_marks::numeric / total_marks::numeric) * 100, 2)
  ) STORED,
  source_json_import boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (obtained_marks <= total_marks)
);

-- 6) Grade validation and conversion functions
CREATE OR REPLACE FUNCTION public.validate_grade_letter(letter text)
RETURNS boolean AS $$
BEGIN
  RETURN letter IN ('A','A-','B','B-','C','C-','D','E','F','I');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.grade_to_points(grade_letter text)
RETURNS numeric AS $$
BEGIN
  RETURN CASE grade_letter
    WHEN 'A'  THEN 10.0
    WHEN 'A-' THEN 9.0
    WHEN 'B'  THEN 8.0
    WHEN 'B-' THEN 7.0
    WHEN 'C'  THEN 6.0
    WHEN 'C-' THEN 5.0
    WHEN 'D'  THEN 4.0
    WHEN 'E'  THEN 0.0
    WHEN 'F'  THEN 0.0
    WHEN 'I'  THEN 0.0
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7) Trigger function to set grade points
CREATE OR REPLACE FUNCTION public.set_grade_points()
RETURNS trigger AS $$
BEGIN
  NEW.grade_points := public.grade_to_points(NEW.grade);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8) Helper function to recompute a single semester SGPA (idempotent)
CREATE OR REPLACE FUNCTION public.recalculate_semester_sgpa_for(sem_id uuid, usr_id uuid)
RETURNS void AS $$
DECLARE
  total_credits_sum integer;
  weighted_points numeric;
  calculated_sgpa numeric;
BEGIN
  SELECT 
    COALESCE(SUM(credits), 0),
    COALESCE(SUM(credits * COALESCE(grade_points, 0)), 0)
  INTO total_credits_sum, weighted_points
  FROM public.subjects
  WHERE semester_id = sem_id AND user_id = usr_id;

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

-- 9) Robust update_semester_sgpa trigger function: recalc both OLD and NEW
CREATE OR REPLACE FUNCTION public.update_semester_sgpa()
RETURNS trigger AS $$
DECLARE
  old_sem uuid;
  new_sem uuid;
  uid uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_sem := NEW.semester_id;
    uid := NEW.user_id;
    PERFORM public.recalculate_semester_sgpa_for(new_sem, uid);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    old_sem := OLD.semester_id;
    uid := OLD.user_id;
    PERFORM public.recalculate_semester_sgpa_for(old_sem, uid);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    uid := NEW.user_id;
    old_sem := OLD.semester_id;
    new_sem := NEW.semester_id;
    -- If semester changed, recompute both old and new semester
    IF old_sem IS DISTINCT FROM new_sem THEN
      PERFORM public.recalculate_semester_sgpa_for(old_sem, uid);
      PERFORM public.recalculate_semester_sgpa_for(new_sem, uid);
    ELSE
      PERFORM public.recalculate_semester_sgpa_for(new_sem, uid);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10) Create triggers
DROP TRIGGER IF EXISTS subjects_grade_points_trigger ON public.subjects;
CREATE TRIGGER subjects_grade_points_trigger
  BEFORE INSERT OR UPDATE OF grade ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_grade_points();

DROP TRIGGER IF EXISTS subjects_update_sgpa_trigger ON public.subjects;
CREATE TRIGGER subjects_update_sgpa_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_semester_sgpa();

-- 11) CGPA calculation function (SECURITY INVOKER for safety)
CREATE OR REPLACE FUNCTION public.get_user_cgpa(target_user_id uuid)
RETURNS numeric AS $$
DECLARE
  total_weighted_credits numeric := 0;
  total_semester_credits numeric := 0;
  calculated_cgpa numeric;
BEGIN
  SELECT 
    COALESCE(SUM(sgpa * total_credits), 0),
    COALESCE(SUM(total_credits), 0)
  INTO total_weighted_credits, total_semester_credits
  FROM public.semesters 
  WHERE user_id = target_user_id AND sgpa IS NOT NULL AND total_credits > 0;

  IF total_semester_credits > 0 THEN
    calculated_cgpa := ROUND(total_weighted_credits / total_semester_credits, 2);
  ELSE
    calculated_cgpa := NULL;
  END IF;

  RETURN calculated_cgpa;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 12) Academic summary function (replaces the problematic view)
CREATE OR REPLACE FUNCTION public.get_user_academic_summary()
RETURNS TABLE (
  user_id uuid,
  total_semesters bigint,
  total_subjects bigint,
  total_credits bigint,
  average_sgpa numeric,
  cgpa numeric,
  backlogs bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    COUNT(DISTINCT s.id) as total_semesters,
    COUNT(DISTINCT sub.id) as total_subjects,
    COALESCE(SUM(s.total_credits), 0) as total_credits,
    AVG(s.sgpa) as average_sgpa,
    public.get_user_cgpa(s.user_id) as cgpa,
    COUNT(CASE WHEN sub.grade IN ('E', 'F', 'I') THEN 1 END) as backlogs
  FROM public.semesters s
  LEFT JOIN public.subjects sub ON s.id = sub.semester_id
  WHERE s.user_id = auth.uid()
  GROUP BY s.user_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE;

-- 13) Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks_records ENABLE ROW LEVEL SECURITY;

-- 14) RLS Policies for profiles (using user_id as PK)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 15) RLS Policies for academic data (user owns their data)
DROP POLICY IF EXISTS "Users own their semesters" ON public.semesters;
CREATE POLICY "Users own their semesters" ON public.semesters
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users own their subjects" ON public.subjects;
CREATE POLICY "Users own their subjects" ON public.subjects
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users own their attendance" ON public.attendance_records;
CREATE POLICY "Users own their attendance" ON public.attendance_records
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users own their marks" ON public.marks_records;
CREATE POLICY "Users own their marks" ON public.marks_records
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 16) Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON public.semesters(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_semester ON public.subjects(user_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_semester ON public.attendance_records(user_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_marks_user_semester ON public.marks_records(user_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_grade ON public.subjects(grade) WHERE grade IS NOT NULL;

-- 17) Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_cgpa(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_academic_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grade_to_points(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_grade_letter(text) TO authenticated;

-- 18) Insert some seed data for testing (optional)
-- This will only work if there's an authenticated user
DO $$
BEGIN
  -- Only insert if auth.uid() is available (i.e., in an authenticated context)
  IF auth.uid() IS NOT NULL THEN
    -- Insert profile
    INSERT INTO public.profiles (user_id, full_name, email, college)
    VALUES (auth.uid(), 'Test Student', 'test@student.edu', 'IIIT Gwalior')
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert sample semester
    INSERT INTO public.semesters (user_id, number, total_credits)
    VALUES (auth.uid(), 1, 0)
    ON CONFLICT (user_id, number) DO NOTHING;
  END IF;
END $$;
