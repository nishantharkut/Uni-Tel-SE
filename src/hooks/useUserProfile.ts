import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ensureUserProfile } from '@/utils/supabaseHelpers';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  college?: string;
  role: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No authenticated user');
        return;
      }

      // Ensure user has a profile (create if doesn't exist)
      const profileData = await ensureUserProfile(user);
      
      if (!profileData) {
        setError('Failed to create or load profile');
        return;
      }

      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: profileData.full_name || user.user_metadata?.full_name || 'User',
        avatar_url: profileData.avatar_url || user.user_metadata?.avatar_url,
        college: profileData.college || 'University',
        role: profileData.role || 'student'
      });
    } catch (err) {
      console.error('Error in loadProfile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  return {
    profile,
    loading,
    error,
    refreshProfile
  };
}
