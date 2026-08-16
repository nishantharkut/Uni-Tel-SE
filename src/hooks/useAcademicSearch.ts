import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAttendance, useMarks, useSemesters, useSubjects } from '@/hooks/useAcademic';
import {
  buildAcademicSearchResults,
  type AcademicSearchResult,
} from '@/services/academicSearchService';

const RECENT_SEARCHES_KEY = 'uni-tel:recent-searches';

function readRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string').slice(0, 6)
      : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(searches: string[]) {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 6)));
}

export function useAcademicSearch(query: string) {
  const { data: semesters = [], isLoading: semestersLoading } = useSemesters();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: marks = [], isLoading: marksLoading } = useMarks();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  const results = useMemo(
    () => buildAcademicSearchResults(query, { semesters, subjects, attendance, marks }),
    [attendance, marks, query, semesters, subjects]
  );

  const saveRecentSearch = useCallback((term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setRecentSearches((previous) => {
      const next = [cleanTerm, ...previous.filter((entry) => entry.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 6);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  return {
    results,
    recentSearches,
    saveRecentSearch,
    isLoading: semestersLoading || subjectsLoading || attendanceLoading || marksLoading,
  };
}

export type { AcademicSearchResult };
