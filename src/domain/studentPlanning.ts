import { calculateEarnedCredits, isGpaGrade, getGradePoints } from '@/domain/academicRules';

export interface GradePointPlan {
  currentCgpa: number;
  completedCredits: number;
  remainingCredits: number;
  targetCgpa: number;
  requiredAverageGradePoints: number | null;
  feasible: boolean;
  message: string;
}

export interface PlanningCourse {
  credits: number;
  grade?: string | null;
  isAudit?: boolean | null;
}

export interface PlanningMarksRecord {
  subject_name: string;
  exam_type: string;
  total_marks: number;
  obtained_marks: number;
  weightage?: number | null;
}

export function estimateRequiredAverageGradePoints(params: {
  currentCgpa: number;
  completedCredits: number;
  remainingCredits: number;
  targetCgpa: number;
}): GradePointPlan {
  const currentCgpa = Number.isFinite(params.currentCgpa) ? params.currentCgpa : 0;
  const completedCredits = Math.max(0, Number.isFinite(params.completedCredits) ? params.completedCredits : 0);
  const remainingCredits = Math.max(0, Number.isFinite(params.remainingCredits) ? params.remainingCredits : 0);
  const targetCgpa = Math.max(0, Math.min(10, Number.isFinite(params.targetCgpa) ? params.targetCgpa : 0));

  if (remainingCredits === 0) {
    const feasible = currentCgpa >= targetCgpa;
    return {
      currentCgpa,
      completedCredits,
      remainingCredits,
      targetCgpa,
      requiredAverageGradePoints: null,
      feasible,
      message: feasible
        ? 'Target already met with recorded credits.'
        : 'Add remaining credits to estimate the required future average.',
    };
  }

  const totalCreditsAfterPlan = completedCredits + remainingCredits;
  const requiredTotalPoints = targetCgpa * totalCreditsAfterPlan;
  const currentTotalPoints = currentCgpa * completedCredits;
  const requiredAverageGradePoints = Math.round(((requiredTotalPoints - currentTotalPoints) / remainingCredits) * 100) / 100;
  const feasible = requiredAverageGradePoints <= 10;

  return {
    currentCgpa,
    completedCredits,
    remainingCredits,
    targetCgpa,
    requiredAverageGradePoints,
    feasible,
    message: feasible
      ? `Average ${Math.max(0, requiredAverageGradePoints).toFixed(2)} grade points are required over the remaining credits.`
      : 'Target is not feasible with 10 grade points in all remaining credits.',
  };
}

export function estimateRemainingCreditsFromSubjects(courses: PlanningCourse[], expectedProgrammeCredits?: number): number {
  const earnedCredits = calculateEarnedCredits(courses);
  if (!expectedProgrammeCredits || expectedProgrammeCredits <= earnedCredits) return 0;
  return expectedProgrammeCredits - earnedCredits;
}

export function calculateSubjectWeightedContribution(records: PlanningMarksRecord[]): {
  recordedWeightage: number;
  weightedScore: number;
  remainingWeightage: number;
} {
  const recorded = records.reduce(
    (acc, record) => {
      const weightage = Math.max(0, Math.min(100, Number(record.weightage ?? 0)));
      if (record.total_marks <= 0 || weightage <= 0) return acc;

      const percentage = Math.max(0, Math.min(100, (record.obtained_marks / record.total_marks) * 100));
      return {
        recordedWeightage: acc.recordedWeightage + weightage,
        weightedScore: acc.weightedScore + percentage * (weightage / 100),
      };
    },
    { recordedWeightage: 0, weightedScore: 0 }
  );

  return {
    recordedWeightage: Math.round(recorded.recordedWeightage * 100) / 100,
    weightedScore: Math.round(recorded.weightedScore * 100) / 100,
    remainingWeightage: Math.max(0, Math.round((100 - recorded.recordedWeightage) * 100) / 100),
  };
}

export function calculateRequiredAverageForTarget(
  records: PlanningMarksRecord[],
  targetOverallPercentage: number
): {
  currentWeightedScore: number;
  recordedWeightage: number;
  remainingWeightage: number;
  requiredAverageInRemaining: number | null;
  feasible: boolean;
  message: string;
} {
  const target = Math.max(0, Math.min(100, targetOverallPercentage));
  const contribution = calculateSubjectWeightedContribution(records);

  if (contribution.remainingWeightage === 0) {
    const feasible = contribution.weightedScore >= target;
    return {
      currentWeightedScore: contribution.weightedScore,
      recordedWeightage: contribution.recordedWeightage,
      remainingWeightage: contribution.remainingWeightage,
      requiredAverageInRemaining: null,
      feasible,
      message: feasible
        ? 'Target is already met by recorded marks.'
        : 'No remaining weightage is available to reach this target.',
    };
  }

  const requiredAverageInRemaining =
    Math.round(((target - contribution.weightedScore) / (contribution.remainingWeightage / 100)) * 100) / 100;
  const feasible = requiredAverageInRemaining <= 100;

  return {
    currentWeightedScore: contribution.weightedScore,
    recordedWeightage: contribution.recordedWeightage,
    remainingWeightage: contribution.remainingWeightage,
    requiredAverageInRemaining,
    feasible,
    message: feasible
      ? `Average ${Math.max(0, requiredAverageInRemaining).toFixed(2)}% is required in the remaining ${contribution.remainingWeightage}% weightage.`
      : 'Target is not feasible with the remaining assessment weightage.',
  };
}

export function countFailedCourses(courses: PlanningCourse[]): number {
  return courses.filter((course) => isGpaGrade(course.grade) && getGradePoints(course.grade) === 0).length;
}
