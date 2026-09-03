import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './env';
import type { Database } from './types';

export type PublicClient = SupabaseClient<Database>;

let cached: PublicClient | null = null;

/**
 * Anonymous, cookie-free client for public content.
 *
 * Deliberately NOT the @supabase/ssr cookie client: reading cookies would opt
 * every page into dynamic rendering and forfeit static generation / ISR. Public
 * content is the same for everyone, so no session is involved.
 *
 * Returns null when Supabase is not configured — callers fall back.
 */
export function getPublicClient(): PublicClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-application-name': 'brandlify-public' } },
    });
  }
  return cached;
}
