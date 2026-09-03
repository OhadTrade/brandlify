/**
 * Supabase configuration, read from the environment only.
 *
 * The site is designed to build and render with Supabase unconfigured: every
 * public query falls back to its built-in default and every data-driven section
 * hides itself. That keeps `npm run build` green before the keys exist and,
 * more importantly, means a Supabase outage degrades the site instead of
 * breaking it.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when the public (anon) client can be constructed. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
