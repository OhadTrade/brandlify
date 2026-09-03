/**
 * Generates supabase/seed.sql from the canonical copy in src/content/.
 *
 * The copy has to exist in two places — in the database (so the admin can edit
 * it) and in the bundle (so the site still renders when the database is
 * unreachable). Writing it twice by hand guarantees drift, so it is written
 * once and the SQL is generated.
 *
 * Run: npm run seed:sql
 */
import { writeFileSync } from 'node:fs';
import { services } from '../src/content/services.ts';
import { faqs } from '../src/content/faqs.ts';
import { siteContent } from '../src/content/site-content.ts';

/** Postgres string literal — doubles single quotes. */
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (items) => `array[\n    ${items.map(lit).join(',\n    ')}\n  ]`;
const json = (value) => `${lit(JSON.stringify(value, null, 2))}::jsonb`;

const header = `-- =============================================================================
-- Brandlify — seed
--
-- GENERATED FILE. Do not edit by hand.
-- Source: src/content/{services,faqs,site-content}.ts
-- Regenerate: npm run seed:sql
--
-- Services, FAQ and core site copy ONLY.
-- Deliberately absent: projects, testimonials, posts. No invented social proof,
-- no placeholder case studies, no fake reviews. Those tables stay empty until
-- there is something real to put in them, and every section that reads them
-- hides itself when empty.
--
-- Idempotent: safe to re-run.
-- =============================================================================
`;

const servicesSql = `
-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------
insert into public.services
  (slug, title, short_desc, icon, full_content, benefits, process_steps, faq, order_index)
values
${services
  .map(
    (s) => `(
  ${lit(s.slug)},
  ${lit(s.title)},
  ${lit(s.short_desc)},
  ${lit(s.icon)},
  ${lit(s.full_content)},
  ${arr(s.benefits)},
  ${json(s.process_steps)},
  ${json(s.faq)},
  ${s.order_index}
)`,
  )
  .join(',\n')}
on conflict (slug) do update set
  title = excluded.title,
  short_desc = excluded.short_desc,
  icon = excluded.icon,
  full_content = excluded.full_content,
  benefits = excluded.benefits,
  process_steps = excluded.process_steps,
  faq = excluded.faq,
  order_index = excluded.order_index;
`;

// faqs has no natural key, so a re-run replaces exactly the seeded questions and
// leaves anything the owner added through /admin untouched.
const faqsSql = `
-- -----------------------------------------------------------------------------
-- faqs — home page accordion
-- -----------------------------------------------------------------------------
delete from public.faqs where question in (
  ${faqs.map((f) => lit(f.question)).join(',\n  ')}
);

insert into public.faqs (question, answer, order_index, published) values
${faqs.map((f) => `(\n  ${lit(f.question)},\n  ${lit(f.answer)},\n  ${f.order_index}, true\n)`).join(',\n')};
`;

const contentSql = `
-- -----------------------------------------------------------------------------
-- site_content — core editable copy
--
-- Every key has a matching default in src/content/site-content.ts, so a missing
-- or malformed row degrades to the built-in copy instead of an empty section.
-- -----------------------------------------------------------------------------
insert into public.site_content (key, value_json) values
${Object.entries(siteContent)
  .map(([key, value]) => `(\n  ${lit(key)},\n  ${json(value)}\n)`)
  .join(',\n')}
on conflict (key) do update set value_json = excluded.value_json;
`;

writeFileSync('supabase/seed.sql', header + servicesSql + faqsSql + contentSql);

console.log('supabase/seed.sql written');
console.log(
  `  ${services.length} services, ${faqs.length} faqs, ${Object.keys(siteContent).length} content keys`,
);
