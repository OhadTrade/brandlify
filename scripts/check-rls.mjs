/**
 * Proves the row level security contract from the outside, over HTTPS, using
 * the real anon key — the same credential that ships in the browser bundle.
 *
 * Reasoning about policies is not evidence. This is.
 *
 * Run: npm run rls
 */
import { readFileSync } from 'node:fs';

// .env.local is not loaded automatically outside Next.
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL_ || !KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY missing from .env.local');
  process.exit(1);
}

const rest = (path, init = {}) =>
  fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

let failures = 0;
const results = [];

function record(name, ok, detail) {
  if (!ok) failures++;
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

/** The anon key may read this table. */
async function expectReadable(table, { minRows = 0 } = {}) {
  const res = await rest(`${table}?select=*`);
  const body = await res.json().catch(() => null);
  const rows = Array.isArray(body) ? body.length : -1;
  record(
    `anon CAN read ${table}`,
    res.ok && rows >= minRows,
    `HTTP ${res.status}, ${rows} rows (expected >= ${minRows})`,
  );
}

/** The anon key may reach the table but sees nothing (RLS filters every row). */
async function expectReadableButEmpty(table) {
  const res = await rest(`${table}?select=*`);
  const body = await res.json().catch(() => null);
  const rows = Array.isArray(body) ? body.length : -1;
  record(
    `anon reads ${table} but sees 0 rows (nothing published)`,
    res.ok && rows === 0,
    `HTTP ${res.status}, ${rows} rows`,
  );
}

/** The anon key must be refused outright. */
async function expectDenied(name, path, init) {
  const res = await rest(path, init);
  const text = await res.text();
  const denied = res.status === 401 || res.status === 403 || /42501|permission denied|violates row-level security/i.test(text);
  record(name, denied, `HTTP ${res.status} ${text.slice(0, 120).replace(/\s+/g, ' ')}`);
  return res;
}

const marker = `rls-check-${Date.now()}`;

async function main() {
  console.log(`Testing ${URL_} with the anon key\n`);

  // --- public reference data: readable -------------------------------------
  await expectReadable('services', { minRows: 5 });
  await expectReadable('faqs', { minRows: 6 });
  await expectReadable('site_content', { minRows: 10 });

  // --- gated content: reachable, but filtered to nothing --------------------
  await expectReadableButEmpty('projects');
  await expectReadableButEmpty('posts');
  await expectReadableButEmpty('testimonials');

  // --- leads: the table that must never leak -------------------------------
  await expectDenied('anon CANNOT read leads', 'leads?select=*');
  await expectDenied('anon CANNOT read leads (single column)', 'leads?select=phone');
  await expectDenied('anon CANNOT read leads (count)', 'leads?select=count', {
    headers: { Prefer: 'count=exact' },
  });

  // A valid submission must go through — the public form depends on it.
  const insert = await rest('leads', {
    method: 'POST',
    body: JSON.stringify({
      name: 'RLS Check',
      phone: '0500000000',
      consent: true,
      message: marker,
    }),
  });
  const insertBody = await insert.text();
  record(
    'anon CAN insert a valid lead',
    insert.status === 201,
    `HTTP ${insert.status} ${insertBody.slice(0, 120)}`,
  );

  // ...and must not be able to read it back, even immediately after writing it.
  record(
    'insert returns no row body (return=minimal)',
    insertBody.trim() === '',
    `body: ${insertBody.slice(0, 80) || '(empty)'}`,
  );
  await expectDenied('anon STILL cannot read leads after inserting', 'leads?select=*');

  // --- the insert policy pins the fields the public must not control -------
  await expectDenied('anon CANNOT insert a lead without consent', 'leads', {
    method: 'POST',
    body: JSON.stringify({ name: 'No Consent', phone: '0500000000', consent: false }),
  });
  await expectDenied('anon CANNOT forge pipeline status', 'leads', {
    method: 'POST',
    body: JSON.stringify({ name: 'Forged', phone: '0500000000', consent: true, status: 'won' }),
  });
  await expectDenied('anon CANNOT write internal notes', 'leads', {
    method: 'POST',
    body: JSON.stringify({ name: 'Notes', phone: '0500000000', consent: true, notes: 'x' }),
  });

  // --- no other write reaches any table ------------------------------------
  await expectDenied('anon CANNOT update leads', 'leads?id=neq.00000000-0000-0000-0000-000000000000', {
    method: 'PATCH',
    body: JSON.stringify({ status: 'won' }),
  });
  await expectDenied('anon CANNOT delete leads', 'leads?id=neq.00000000-0000-0000-0000-000000000000', {
    method: 'DELETE',
  });
  await expectDenied('anon CANNOT insert a project', 'projects', {
    method: 'POST',
    body: JSON.stringify({ slug: 'hacked', business_name: 'x', category: 'x', published: true }),
  });
  await expectDenied('anon CANNOT update site_content', 'site_content?key=eq.home.hero', {
    method: 'PATCH',
    body: JSON.stringify({ value_json: {} }),
  });
  await expectDenied('anon CANNOT delete a service', 'services?slug=eq.websites', {
    method: 'DELETE',
  });

  console.log(results.join('\n'));
  console.log(
    `\nTest lead marker: ${marker} (delete it with: delete from public.leads where message = '${marker}';)`,
  );

  if (failures) {
    console.error(`\n${failures} RLS expectation(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll RLS expectations hold.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
