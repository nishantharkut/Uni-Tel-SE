import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  DEFAULT_USER_PREFERENCES,
  USER_PREFERENCES_CHANGED_EVENT,
  userPreferencesService,
  type UserPreferences,
} from '@/services/userPreferencesService';

export type UserPreferencesUpdate = Partial<Omit<UserPreferences, 'notifications'>> & {
  notifications?: Partial<UserPreferences['notifications']>;
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);

  useEffect(() => {
    setPreferences(userPreferencesService.get(user?.id));
  }, [user?.id]);

  useEffect(() => {
    const handlePreferenceChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string; preferences: UserPreferences }>;
      const activeUserId = user?.id || 'local';
      if (customEvent.detail?.userId !== activeUserId) return;
      setPreferences(customEvent.detail.preferences);
    };

    window.addEventListener(USER_PREFERENCES_CHANGED_EVENT, handlePreferenceChange);
    return () => window.removeEventListener(USER_PREFERENCES_CHANGED_EVENT, handlePreferenceChange);
  }, [user?.id]);

  const updatePreferences = useCallback((updates: UserPreferencesUpdate) => {
    setPreferences((current) => {
      const next: UserPreferences = {
        ...current,
        ...updates,
        notifications: {
          ...current.notifications,
          ...(updates.notifications ?? {}),
        },
      };
      return userPreferencesService.save(next, user?.id);
    });
  }, [user?.id]);

  const resetPreferences = useCallback(() => {
    setPreferences(userPreferencesService.reset(user?.id));
  }, [user?.id]);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
}
