import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { faqs as faqsFallback } from '@/content/faqs';
import { services as servicesFallback, type ServiceFaq, type ServiceStep } from '@/content/services';
import { contentDefaults, parseContent, type Content, type ContentKey } from '@/lib/content';
import { getPublicClient } from '@/lib/supabase/public';
import type { PostRow, ProjectRow, ServiceRow, TestimonialRow } from '@/lib/supabase/types';

/**
 * Read-side data access for the public site.
 *
 * Three rules hold for every function here:
 *   1. It never throws. A Supabase outage or a missing key returns the empty
 *      value, and the section that asked for it hides itself.
 *   2. It never reads cookies, so pages stay static / ISR.
 *   3. Its result is tagged, so publishing from /admin can revalidate exactly
 *      the pages that changed instead of the whole site.
 *
 * Services and FAQ additionally fall back to the canonical copy in src/content/
 * rather than to nothing: they are the offering itself, and a page that shows
 * no services because a database blinked is worse than a slightly stale one.
 * Projects, posts and testimonials have no fallback by design — an empty
 * portfolio must read as empty, never as invented.
 */

export const TAGS = {
  projects: 'projects',
  posts: 'posts',
  testimonials: 'testimonials',
  services: 'services',
  faqs: 'faqs',
  content: 'site_content',
} as const;

const REVALIDATE_SECONDS = 300;

function cached<Args extends unknown[], Result>(
  keyParts: string[],
  tags: string[],
  fn: (...args: Args) => Promise<Result>,
) {
  return unstable_cache(fn, keyParts, { tags, revalidate: REVALIDATE_SECONDS });
}

/** Log and swallow: a read failure must never take a page down. */
function onError(where: string, error: unknown) {
  console.error(`[queries] ${where}`, error);
}

// -----------------------------------------------------------------------------
// services
// -----------------------------------------------------------------------------

const stepSchema = z.object({ title: z.string(), description: z.string() });
const faqSchema = z.object({ question: z.string(), answer: z.string() });

/** What the UI needs — deliberately narrower than the database row. */
export type Service = {
  slug: string;
  title: string;
  short_desc: string;
  icon: string | null;
  full_content: string | null;
  benefits: string[];
  process_steps: ServiceStep[];
  faq: ServiceFaq[];
  order_index: number;
};

function toService(row: ServiceRow): Service {
  const steps = z.array(stepSchema).safeParse(row.process_steps);
  const faq = z.array(faqSchema).safeParse(row.faq);
  return {
    slug: row.slug,
    title: row.title,
    short_desc: row.short_desc,
    icon: row.icon,
    full_content: row.full_content,
    benefits: row.benefits,
    process_steps: steps.success ? steps.data : [],
    faq: faq.success ? faq.data : [],
    order_index: row.order_index,
  };
}

export const getServices = cached(
  ['services', 'all'],
  [TAGS.services],
  async (): Promise<Service[]> => {
    const supabase = getPublicClient();
    if (!supabase) return servicesFallback;
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) {
      onError('getServices', error);
      return servicesFallback;
    }
    return data && data.length > 0 ? data.map(toService) : servicesFallback;
  },
);

export const getServiceBySlug = cached(
  ['services', 'by-slug'],
  [TAGS.services],
  async (slug: string): Promise<Service | null> => {
    const fallback = servicesFallback.find((s) => s.slug === slug) ?? null;
    const supabase = getPublicClient();
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      onError('getServiceBySlug', error);
      return fallback;
    }
    return data ? toService(data) : fallback;
  },
);

// -----------------------------------------------------------------------------
// faqs
// -----------------------------------------------------------------------------

export type Faq = { question: string; answer: string; order_index: number };

export const getFaqs = cached(['faqs', 'published'], [TAGS.faqs], async (): Promise<Faq[]> => {
  const supabase = getPublicClient();
  if (!supabase) return faqsFallback;
  const { data, error } = await supabase
    .from('faqs')
    .select('question, answer, order_index')
    .order('order_index', { ascending: true });
  if (error) {
    onError('getFaqs', error);
    return faqsFallback;
  }
  return data && data.length > 0 ? data : faqsFallback;
});

// -----------------------------------------------------------------------------
// projects — no fallback. Empty means empty.
// -----------------------------------------------------------------------------

export const getPublishedProjects = cached(
  ['projects', 'published'],
  [TAGS.projects],
  async (): Promise<ProjectRow[]> => {
    const supabase = getPublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      onError('getPublishedProjects', error);
      return [];
    }
    // RLS already filters to published; the predicate documents the intent.
    return (data ?? []).filter((p) => p.published);
  },
);

export const getProjectBySlug = cached(
  ['projects', 'by-slug'],
  [TAGS.projects],
  async (slug: string): Promise<ProjectRow | null> => {
    const supabase = getPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      onError('getProjectBySlug', error);
      return null;
    }
    return data ?? null;
  },
);

// -----------------------------------------------------------------------------
// posts — no fallback
// -----------------------------------------------------------------------------

export const getPublishedPosts = cached(
  ['posts', 'published'],
  [TAGS.posts],
  async (limit?: number): Promise<PostRow[]> => {
    const supabase = getPublicClient();
    if (!supabase) return [];
    let query = supabase.from('posts').select('*').order('published_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      onError('getPublishedPosts', error);
      return [];
    }
    return data ?? [];
  },
);

export const getPostBySlug = cached(
  ['posts', 'by-slug'],
  [TAGS.posts],
  async (slug: string): Promise<PostRow | null> => {
    const supabase = getPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
    if (error) {
      onError('getPostBySlug', error);
      return null;
    }
    return data ?? null;
  },
);

// -----------------------------------------------------------------------------
// testimonials — no fallback, ever. Only real, approved reviews.
// -----------------------------------------------------------------------------

export const getApprovedTestimonials = cached(
  ['testimonials', 'approved'],
  [TAGS.testimonials],
  async (): Promise<TestimonialRow[]> => {
    const supabase = getPublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) {
      onError('getApprovedTestimonials', error);
      return [];
    }
    return data ?? [];
  },
);

// -----------------------------------------------------------------------------
// site_content
// -----------------------------------------------------------------------------

const getContentMap = cached(
  ['site_content', 'all'],
  [TAGS.content],
  async (): Promise<Record<string, unknown>> => {
    const supabase = getPublicClient();
    if (!supabase) return {};
    const { data, error } = await supabase.from('site_content').select('key, value_json');
    if (error) {
      onError('getContentMap', error);
      return {};
    }
    return Object.fromEntries((data ?? []).map((row) => [row.key, row.value_json]));
  },
);

/**
 * Editable copy for one key. Falls back to the canonical copy when the row is
 * missing, malformed, or Supabase is unreachable — the section always renders.
 */
export async function getContent<K extends ContentKey>(key: K): Promise<Content<K>> {
  const map = await getContentMap();
  if (!(key in map)) return contentDefaults[key];
  return parseContent(key, map[key]);
}

/**
 * Copy that has no default and no invented stand-in — the owner's own words.
 *
 * Returns null until the row exists, and the sections that use it render
 * nothing. Writing a plausible-sounding company story and shipping it as if it
 * were true is exactly the thing this codebase refuses to do.
 */
export async function getAuthoredContent(
  key: string,
): Promise<{ title?: string; body: string } | null> {
  const map = await getContentMap();
  const raw = map[key];
  const parsed = z
    .object({ title: z.string().optional(), body: z.string().min(1) })
    .safeParse(raw);
  return parsed.success ? parsed.data : null;
}
