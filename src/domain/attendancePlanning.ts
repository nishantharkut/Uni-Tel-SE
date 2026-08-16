import { MINIMUM_ATTENDANCE_PERCENTAGE } from '@/domain/academicRules';

export type AttendanceRiskLevel = 'no-data' | 'critical' | 'watch' | 'safe';

export interface AttendancePlan {
  attendedClasses: number;
  totalClasses: number;
  percentage: number;
  targetPercentage: number;
  riskLevel: AttendanceRiskLevel;
  safeSkips: number;
  classesNeededToRecover: number;
  message: string;
}

function normaliseClassCount(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

export function calculateAttendancePercentage(attendedClasses: number, totalClasses: number): number {
  const attended = normaliseClassCount(attendedClasses);
  const total = normaliseClassCount(totalClasses);

  if (total === 0) return 0;

  return Math.round((Math.min(attended, total) / total) * 10000) / 100;
}

export function calculateSafeSkips(
  attendedClasses: number,
  totalClasses: number,
  targetPercentage = MINIMUM_ATTENDANCE_PERCENTAGE
): number {
  const attended = normaliseClassCount(attendedClasses);
  const total = normaliseClassCount(totalClasses);
  const targetRatio = targetPercentage / 100;

  if (total === 0 || targetRatio <= 0 || targetRatio >= 1) return 0;
  if (calculateAttendancePercentage(attended, total) < targetPercentage) return 0;

  return Math.max(0, Math.floor(attended / targetRatio - total));
}

export function calculateClassesNeededToRecover(
  attendedClasses: number,
  totalClasses: number,
  targetPercentage = MINIMUM_ATTENDANCE_PERCENTAGE
): number {
  const attended = normaliseClassCount(attendedClasses);
  const total = normaliseClassCount(totalClasses);
  const targetRatio = targetPercentage / 100;

  if (targetRatio <= 0) return 0;
  if (targetRatio >= 1) return attended >= total && total > 0 ? 0 : Infinity;
  if (total === 0 || calculateAttendancePercentage(attended, total) >= targetPercentage) return 0;

  return Math.max(0, Math.ceil((targetRatio * total - attended) / (1 - targetRatio)));
}

export function getAttendanceRiskLevel(
  attendedClasses: number,
  totalClasses: number,
  targetPercentage = MINIMUM_ATTENDANCE_PERCENTAGE
): AttendanceRiskLevel {
  const total = normaliseClassCount(totalClasses);
  if (total === 0) return 'no-data';

  const percentage = calculateAttendancePercentage(attendedClasses, totalClasses);
  if (percentage < targetPercentage) return 'critical';
  if (percentage < Math.max(targetPercentage + 10, 85)) return 'watch';
  return 'safe';
}

export function buildAttendancePlan(
  attendedClasses: number,
  totalClasses: number,
  targetPercentage = MINIMUM_ATTENDANCE_PERCENTAGE
): AttendancePlan {
  const attended = Math.min(normaliseClassCount(attendedClasses), normaliseClassCount(totalClasses));
  const total = normaliseClassCount(totalClasses);
  const percentage = calculateAttendancePercentage(attended, total);
  const riskLevel = getAttendanceRiskLevel(attended, total, targetPercentage);
  const safeSkips = calculateSafeSkips(attended, total, targetPercentage);
  const classesNeededToRecover = calculateClassesNeededToRecover(attended, total, targetPercentage);

  let message = 'Start recording classes to calculate attendance risk.';
  if (riskLevel === 'safe') {
    message = `Safe. You can miss ${safeSkips} more class${safeSkips === 1 ? '' : 'es'} and stay at or above ${targetPercentage}%.`;
  } else if (riskLevel === 'watch') {
    message = safeSkips > 0
      ? `Watch closely. You can miss ${safeSkips} more class${safeSkips === 1 ? '' : 'es'} before dropping below ${targetPercentage}%.`
      : `At the minimum. Attend the next class to protect the ${targetPercentage}% requirement.`;
  } else if (riskLevel === 'critical') {
    message = `Below minimum. Attend ${classesNeededToRecover} consecutive class${classesNeededToRecover === 1 ? '' : 'es'} to reach ${targetPercentage}%.`;
  }

  return {
    attendedClasses: attended,
    totalClasses: total,
    percentage,
    targetPercentage,
    riskLevel,
    safeSkips,
    classesNeededToRecover,
    message,
  };
}

export function getAttendanceRiskLabel(riskLevel: AttendanceRiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return 'Safe';
    case 'watch':
      return 'Watch';
    case 'critical':
      return 'Critical';
    default:
      return 'No Data';
  }
}
