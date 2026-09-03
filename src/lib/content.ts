import { z } from 'zod';
import { siteContent } from '@/content/site-content';

/**
 * The `site_content` contract.
 *
 * Rows are validated on read: a missing, malformed or half-edited row falls
 * back to the canonical copy in src/content/site-content.ts rather than
 * rendering an empty or broken section. That same file generates the seed, so
 * the database and the fallback can never drift.
 */

const stat = z.object({ value: z.string(), unit: z.string(), label: z.string() });
const titled = z.object({ title: z.string(), description: z.string() });

export const contentSchemas = {
  'home.hero': z.object({
    title: z.string(),
    services_line: z.string(),
    subtitle: z.string(),
    cta_primary: z.string(),
    cta_secondary: z.string(),
  }),
  'home.stats': z.object({ items: z.array(stat).min(1) }),
  'home.split': z.object({
    title: z.string(),
    body: z.string(),
    points: z.array(titled).min(1),
  }),
  'home.build_brand_grow': z.object({
    eyebrow: z.string(),
    title: z.string(),
    stages: z.array(titled.extend({ key: z.string() })).min(1),
  }),
  'home.process': z.object({
    title: z.string(),
    subtitle: z.string(),
    steps: z.array(titled).min(1),
  }),
  'home.automations': z.object({
    title: z.string(),
    body: z.string(),
    items: z.array(z.string()).min(1),
  }),
  'home.why': z.object({ title: z.string(), cards: z.array(titled).min(1) }),
  'home.promises': z.object({
    title: z.string(),
    subtitle: z.string(),
    items: z.array(titled).min(1),
  }),
  'home.cta_final': z.object({
    title: z.string(),
    body: z.string(),
    cta_primary: z.string(),
    cta_secondary: z.string(),
  }),
  'home.faq': z.object({ title: z.string(), subtitle: z.string() }),
} as const;

export type ContentKey = keyof typeof contentSchemas;
export type Content<K extends ContentKey> = z.infer<(typeof contentSchemas)[K]>;

export const contentDefaults = siteContent as { [K in ContentKey]: Content<K> };

/** Validate a raw `value_json` against its key, falling back to the default. */
export function parseContent<K extends ContentKey>(key: K, raw: unknown): Content<K> {
  const parsed = contentSchemas[key].safeParse(raw);
  if (parsed.success) return parsed.data as Content<K>;
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[content] "${key}" failed validation, using default.`, parsed.error.issues);
  }
  return contentDefaults[key];
}
