import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl } from './env';
import type { Database } from './types';

/**
 * Service-role client. Bypasses row level security entirely.
 *
 * `server-only` makes importing this from a Client Component a build error, so
 * the key cannot end up in a browser bundle by accident. Use it only where the
 * server has already decided the caller is allowed: the lead API route (which
 * runs its own rate limit + Turnstile check first) and admin mutations.
 */
export function getAdminClient(): SupabaseClient<Database> | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'brandlify-admin' } },
  });
}
