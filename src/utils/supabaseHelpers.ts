/**
 * Supabase Helper Functions
 * 
 * This file contains utility functions for handling Supabase operations
 * and ensuring proper user profile setup.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures user has a profile record in the database
 * Creates one if it doesn't exist
 */
export async function ensureUserProfile(user: any) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no profile exists
      console.error('Error fetching profile:', fetchError);
      return null;
    }

    if (existingProfile) {
      return existingProfile;
    }

    // Create profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        college: user.user_metadata?.college || 'University',
        role: user.user_metadata?.role || 'student',
        avatar_url: user.user_metadata?.avatar_url
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
}

/**
 * Handles Supabase errors gracefully
 */
export function handleSupabaseError(error: any, context: string) {
  console.error(`Supabase error in ${context}:`, error);
  
  // Common error handling
  if (error?.code === 'PGRST301') {
    console.warn('Row Level Security policy violation');
  } else if (error?.code === 'PGRST116') {
    console.warn('No rows found');
  } else if (error?.status === 406) {
    console.warn('Not Acceptable - check RLS policies');
  }
}
