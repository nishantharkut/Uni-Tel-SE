import type { AttendanceRecord, MarksRecord, Semester, Subject } from '@/services/academicService';
import { buildAttendancePlan } from '@/domain/attendancePlanning';

export type AcademicSearchCategory = 'semester' | 'subject' | 'attendance' | 'marks' | 'analytics' | 'resource';

export interface AcademicSearchResult {
  id: string;
  category: AcademicSearchCategory;
  title: string;
  description: string;
  route: string;
  keywords: string[];
}

interface AcademicSearchInput {
  semesters: Semester[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
}

const STATIC_RESULTS: AcademicSearchResult[] = [
  {
    id: 'analytics-dashboard',
    category: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Open CGPA trends, attendance analysis, insights, and planning tools.',
    route: '/analytics',
    keywords: ['analytics', 'dashboard', 'cgpa', 'sgpa', 'trend', 'performance', 'insights'],
  },
  {
    id: 'attendance-tracker',
    category: 'attendance',
    title: 'Attendance Tracker',
    description: 'Track attendance, safe skips, and recovery requirements.',
    route: '/attendance',
    keywords: ['attendance', 'classes', 'present', 'absent', 'safe skip', 'recovery'],
  },
  {
    id: 'marks-manager',
    category: 'marks',
    title: 'Marks Manager',
    description: 'Manage exams, marks, weightages, and target planning.',
    route: '/marks',
    keywords: ['marks', 'exam', 'weightage', 'minor', 'major', 'quiz', 'score'],
  },
  {
    id: 'semester-manager',
    category: 'semester',
    title: 'Semester Manager',
    description: 'Create semesters, subjects, credits, grades, and academic records.',
    route: '/semesters',
    keywords: ['semester', 'subject', 'course', 'credit', 'grade'],
  },
  {
    id: 'iiitm-ordinance-resource',
    category: 'resource',
    title: 'IIITM Academic Ordinance',
    description: 'Reference for grading, attendance, credits, and assessment rules.',
    route: '/coming-soon?resource=ordinance',
    keywords: ['iiitm', 'ordinance', 'rules', 'academic rules', 'attendance 75'],
  },
  {
    id: 'json-import-guide',
    category: 'resource',
    title: 'JSON Import Guide',
    description: 'Understand the supported academic import/export format.',
    route: '/coming-soon?resource=json-import',
    keywords: ['json', 'import', 'export', 'backup', 'data'],
  },
];

function normalise(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function includesQuery(result: AcademicSearchResult, query: string): boolean {
  const searchableText = [
    result.title,
    result.description,
    result.category,
    ...result.keywords,
  ].map(normalise).join(' ');

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchableText.includes(term));
}

function buildSemesterLabel(semesterId: string, semesters: Semester[]): string {
  const semester = semesters.find((entry) => entry.id === semesterId);
  return semester ? `Semester ${semester.number}` : 'Unknown semester';
}

export function buildAcademicSearchResults(
  query: string,
  { semesters, subjects, attendance, marks }: AcademicSearchInput
): AcademicSearchResult[] {
  const dynamicResults: AcademicSearchResult[] = [
    ...semesters.map((semester) => ({
      id: `semester-${semester.id}`,
      category: 'semester' as const,
      title: `Semester ${semester.number}`,
      description: `${semester.total_credits ?? 0} tracked credits${semester.sgpa ? `, SGPA ${semester.sgpa.toFixed(2)}` : ''}.`,
      route: '/semesters',
      keywords: ['semester', `semester ${semester.number}`, 'sgpa', 'credits'],
    })),
    ...subjects.map((subject) => ({
      id: `subject-${subject.id}`,
      category: 'subject' as const,
      title: subject.name,
      description: `${buildSemesterLabel(subject.semester_id, semesters)} · ${subject.credits} credits${subject.grade ? ` · Grade ${subject.grade}` : ' · Grade pending'}.`,
      route: '/semesters',
      keywords: ['subject', 'course', 'grade', 'credit', subject.name, subject.grade ?? 'pending'],
    })),
    ...attendance.map((record) => {
      const plan = buildAttendancePlan(record.attended_classes, record.total_classes);
      return {
        id: `attendance-${record.id}`,
        category: 'attendance' as const,
        title: `${record.subject_name} attendance`,
        description: `${buildSemesterLabel(record.semester_id, semesters)} · ${plan.percentage.toFixed(1)}% · ${plan.message}`,
        route: '/attendance',
        keywords: ['attendance', 'classes', 'safe skip', 'recovery', record.subject_name],
      };
    }),
    ...marks.map((record) => {
      const percentage = record.total_marks > 0
        ? Math.round((record.obtained_marks / record.total_marks) * 10000) / 100
        : 0;
      return {
        id: `marks-${record.id}`,
        category: 'marks' as const,
        title: `${record.subject_name} ${record.exam_type}`,
        description: `${buildSemesterLabel(record.semester_id, semesters)} · ${record.obtained_marks}/${record.total_marks} (${percentage.toFixed(1)}%)${record.weightage ? ` · ${record.weightage}% weightage` : ''}.`,
        route: '/marks',
        keywords: ['marks', 'exam', 'score', 'weightage', record.subject_name, record.exam_type],
      };
    }),
  ];

  const allResults = [...STATIC_RESULTS, ...dynamicResults];
  const normalisedQuery = normalise(query);

  if (!normalisedQuery) {
    return allResults.slice(0, 8);
  }

  return allResults
    .filter((result) => includesQuery(result, normalisedQuery))
    .slice(0, 12);
}
