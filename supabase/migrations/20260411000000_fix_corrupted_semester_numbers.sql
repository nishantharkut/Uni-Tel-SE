-- Fix semester numbers corrupted by the "7" + 0 → "70" type-coercion bug.
--
-- The old import edge-function concatenated the semester number (as a string)
-- with a numeric literal, producing values like 70, 80, 90, ... instead of
-- 7, 8, 9, ... .  Because the CHECK (number >= 1 AND number <= 12) constraint
-- was absent from the live database at the time, those corrupted values were
-- persisted.
--
-- This migration:
--  1. Fixes every corrupted row.  Where the corrected number is already
--     occupied by another row of the same user the corrupted row is deleted
--     (it is a duplicate); otherwise it is updated in-place.
--  2. Adds the CHECK constraint and ensures the UNIQUE constraint are present
--     so the corruption cannot happen again.

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT id, user_id, number, number / 10 AS corrected
    FROM public.semesters
    WHERE number > 12
      AND number % 10 = 0
      AND (number / 10) BETWEEN 1 AND 12
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.semesters
      WHERE user_id = rec.user_id
        AND number  = rec.corrected
        AND id     != rec.id
    ) THEN
      -- A record with the correct number already exists; remove the duplicate.
      DELETE FROM public.semesters WHERE id = rec.id;
    ELSE
      -- No conflict – just correct the number.
      UPDATE public.semesters
      SET number = rec.corrected
      WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- Add the CHECK constraint if it is missing (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.semesters'::regclass
      AND conname   = 'semesters_number_check'
  ) THEN
    ALTER TABLE public.semesters
      ADD CONSTRAINT semesters_number_check
      CHECK (number >= 1 AND number <= 12);
  END IF;
END $$;

-- Ensure the UNIQUE constraint on (user_id, number) is present (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.semesters'::regclass
      AND conname   = 'semesters_user_id_number_key'
  ) THEN
    ALTER TABLE public.semesters
      ADD CONSTRAINT semesters_user_id_number_key UNIQUE (user_id, number);
  END IF;
END $$;
