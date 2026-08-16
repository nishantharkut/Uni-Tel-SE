export type GradeScalePreference = '10-point' | '4-point' | 'percentage';

export interface UserPreferences {
  gradeScale: GradeScalePreference;
  attendanceWarningThreshold: number;
  cgpaTarget: number;
  examReminderDays: number;
  notifications: {
    attendanceWarnings: boolean;
    gradeUpdates: boolean;
    examReminders: boolean;
    dataHealthAlerts: boolean;
  };
}

const STORAGE_PREFIX = 'uni-tel:user-preferences';
export const USER_PREFERENCES_CHANGED_EVENT = 'uni-tel:user-preferences-changed';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  gradeScale: '10-point',
  attendanceWarningThreshold: 75,
  cgpaTarget: 8.5,
  examReminderDays: 7,
  notifications: {
    attendanceWarnings: true,
    gradeUpdates: true,
    examReminders: true,
    dataHealthAlerts: true,
  },
};

function getPreferenceKey(userId?: string | null): string {
  return `${STORAGE_PREFIX}:${userId || 'local'}`;
}

function publishPreferenceChange(userId: string | null | undefined, preferences: UserPreferences) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(USER_PREFERENCES_CHANGED_EVENT, {
    detail: {
      userId: userId || 'local',
      preferences,
    },
  }));
}

function isGradeScale(value: unknown): value is GradeScalePreference {
  return value === '10-point' || value === '4-point' || value === 'percentage';
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function mergePreferences(value: unknown): UserPreferences {
  if (!value || typeof value !== 'object') return DEFAULT_USER_PREFERENCES;
  const stored = value as Partial<UserPreferences>;
  const storedNotifications = stored.notifications ?? {};

  return {
    gradeScale: isGradeScale(stored.gradeScale) ? stored.gradeScale : DEFAULT_USER_PREFERENCES.gradeScale,
    attendanceWarningThreshold: asNumber(
      stored.attendanceWarningThreshold,
      DEFAULT_USER_PREFERENCES.attendanceWarningThreshold,
      50,
      95
    ),
    cgpaTarget: asNumber(stored.cgpaTarget, DEFAULT_USER_PREFERENCES.cgpaTarget, 0, 10),
    examReminderDays: asNumber(stored.examReminderDays, DEFAULT_USER_PREFERENCES.examReminderDays, 0, 30),
    notifications: {
      attendanceWarnings: asBoolean(
        storedNotifications.attendanceWarnings,
        DEFAULT_USER_PREFERENCES.notifications.attendanceWarnings
      ),
      gradeUpdates: asBoolean(
        storedNotifications.gradeUpdates,
        DEFAULT_USER_PREFERENCES.notifications.gradeUpdates
      ),
      examReminders: asBoolean(
        storedNotifications.examReminders,
        DEFAULT_USER_PREFERENCES.notifications.examReminders
      ),
      dataHealthAlerts: asBoolean(
        storedNotifications.dataHealthAlerts,
        DEFAULT_USER_PREFERENCES.notifications.dataHealthAlerts
      ),
    },
  };
}

export const userPreferencesService = {
  get(userId?: string | null): UserPreferences {
    try {
      const stored = localStorage.getItem(getPreferenceKey(userId));
      if (!stored) return DEFAULT_USER_PREFERENCES;
      return mergePreferences(JSON.parse(stored));
    } catch {
      return DEFAULT_USER_PREFERENCES;
    }
  },

  save(preferences: UserPreferences, userId?: string | null): UserPreferences {
    const merged = mergePreferences(preferences);
    localStorage.setItem(getPreferenceKey(userId), JSON.stringify(merged));
    publishPreferenceChange(userId, merged);
    return merged;
  },

  reset(userId?: string | null): UserPreferences {
    localStorage.removeItem(getPreferenceKey(userId));
    publishPreferenceChange(userId, DEFAULT_USER_PREFERENCES);
    return DEFAULT_USER_PREFERENCES;
  },
};
