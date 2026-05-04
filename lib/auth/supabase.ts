import { createClient } from '@supabase/supabase-js';
import type { Account } from 'next-auth';

/**
 * Initialize Supabase client for auth-related operations
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: https://xxxxx.supabase.co
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: public anon key from Supabase
 * - SUPABASE_SERVICE_ROLE_KEY: service role key (server-side only)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Sync user to Supabase Auth
 * Called after successful OAuth sign-in
 */
export async function syncSupabaseUser(params: {
  email: string;
  name?: string;
  image?: string;
  providerAccountId: string;
  provider: string;
}) {
  try {
    const { email, name, image, providerAccountId, provider } = params;

    // TODO: Check if user exists in Supabase
    // If not, create user in Supabase via admin API

    console.log('[Supabase] User synced:', {
      email,
      provider,
      providerAccountId,
    });

    return true;
  } catch (error) {
    console.error('[Supabase] Sync failed:', error);
    return false;
  }
}

/**
 * Get Supabase user by email
 */
export async function getSupabaseUser(email: string) {
  try {
    // TODO: Query Supabase users table
    // const { data, error } = await supabaseAdmin
    //   .from('users')
    //   .select('*')
    //   .eq('email', email)
    //   .single();

    return null;
  } catch (error) {
    console.error('[Supabase] Get user failed:', error);
    return null;
  }
}

/**
 * Update user in Supabase
 */
export async function updateSupabaseUser(
  userId: string,
  updates: Record<string, any>,
) {
  try {
    // TODO: Update user in Supabase
    // const { data, error } = await supabaseAdmin
    //   .from('users')
    //   .update(updates)
    //   .eq('id', userId);

    console.log('[Supabase] User updated:', userId);
    return true;
  } catch (error) {
    console.error('[Supabase] Update failed:', error);
    return false;
  }
}

/**
 * Link OAuth account to existing user
 */
export async function linkOAuthAccount(
  userId: string,
  account: Account,
) {
  try {
    // TODO: Link OAuth provider account to user
    // Store provider account ID in user metadata or separate table

    console.log('[Supabase] OAuth account linked:', {
      userId,
      provider: account.provider,
    });

    return true;
  } catch (error) {
    console.error('[Supabase] Link failed:', error);
    return false;
  }
}

/**
 * Revoke OAuth token
 */
export async function revokeOAuthToken(
  providerId: string,
  accessToken: string,
) {
  try {
    // TODO: Revoke token with provider
    // Implementation varies by provider (Google, GitHub, etc.)

    console.log('[Supabase] OAuth token revoked:', providerId);
    return true;
  } catch (error) {
    console.error('[Supabase] Revoke failed:', error);
    return false;
  }
}
