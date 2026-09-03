'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { TAGS } from '@/lib/queries';
import { createServerSupabase } from '@/lib/supabase/server';
import type { LeadRow, LeadStatus } from '@/lib/supabase/types';

/**
 * Admin mutations.
 *
 * Every one of these runs through the visitor's own Supabase session, not the
 * service-role key. That means row level security is still doing the enforcing:
 * if the session is missing or expired the write is refused by the database, not
 * by a check in this file. The service-role client is reserved for the lead API
 * route, where there is no user to act as.
 *
 * Each mutation revalidates only the tag it touched, so publishing a post does
 * not rebuild the portfolio.
 */

async function client() {
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error('Supabase is not configured');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  return supabase;
}

const str = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
};

const list = (form: FormData, key: string) =>
  (str(form, key) ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// -----------------------------------------------------------------------------
// auth
// -----------------------------------------------------------------------------

export async function signIn(_prev: { error?: string } | null, form: FormData) {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: 'Supabase לא מוגדר' };

  const email = str(form, 'email');
  const password = str(form, 'password');
  if (!email || !password) return { error: 'צריך אימייל וסיסמה' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Deliberately generic: distinguishing "no such user" from "wrong password"
  // hands an attacker a way to enumerate accounts.
  if (error) return { error: 'האימייל או הסיסמה שגויים' };

  redirect(str(form, 'next') ?? '/admin');
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase?.auth.signOut();
  redirect('/admin/login');
}

// -----------------------------------------------------------------------------
// leads
// -----------------------------------------------------------------------------

export async function updateLead(form: FormData) {
  const supabase = await client();
  const id = str(form, 'id');
  if (!id) return;

  const patch: Partial<Pick<LeadRow, 'status' | 'notes'>> = {};
  const status = str(form, 'status');
  if (status) patch.status = status as LeadStatus;
  if (form.has('notes')) patch.notes = str(form, 'notes');

  const { error } = await supabase.from('leads').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function deleteLead(form: FormData) {
  const supabase = await client();
  const id = str(form, 'id');
  if (!id) return;
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

// -----------------------------------------------------------------------------
// projects
// -----------------------------------------------------------------------------

export async function saveProject(form: FormData) {
  const supabase = await client();
  const id = str(form, 'id');

  const row = {
    slug: str(form, 'slug') ?? '',
    business_name: str(form, 'business_name') ?? '',
    category: str(form, 'category') ?? '',
    description: str(form, 'description'),
    challenge: str(form, 'challenge'),
    solution: str(form, 'solution'),
    results: str(form, 'results'),
    services: list(form, 'services'),
    cover_image: str(form, 'cover_image'),
    gallery: list(form, 'gallery'),
    live_url: str(form, 'live_url'),
    featured: form.get('featured') === 'on',
    published: form.get('published') === 'on',
    order_index: Number(str(form, 'order_index') ?? 0) || 0,
  };

  const { error } = id
    ? await supabase.from('projects').update(row).eq('id', id)
    : await supabase.from('projects').insert(row);
  if (error) throw new Error(error.message);

  revalidateTag(TAGS.projects);
  redirect('/admin/projects');
}

export async function togglePublished(form: FormData) {
  const supabase = await client();
  const table = str(form, 'table');
  const id = str(form, 'id');
  const next = form.get('next') === 'true';
  if (!id || (table !== 'projects' && table !== 'posts')) return;

  // A published post must carry a date — the database enforces it, so fill it
  // here rather than letting the constraint reject the update.
  const { error } =
    table === 'posts'
      ? await supabase
          .from('posts')
          .update({ published: next, published_at: next ? new Date().toISOString() : null })
          .eq('id', id)
      : await supabase.from('projects').update({ published: next }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidateTag(table === 'projects' ? TAGS.projects : TAGS.posts);
  revalidatePath(`/admin/${table}`);
}

export async function deleteRow(form: FormData) {
  const supabase = await client();
  const table = str(form, 'table');
  const id = str(form, 'id');
  if (!id) return;
  if (table !== 'projects' && table !== 'posts' && table !== 'testimonials') return;

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidateTag(
    table === 'projects' ? TAGS.projects : table === 'posts' ? TAGS.posts : TAGS.testimonials,
  );
  revalidatePath(`/admin/${table}`);
}

// -----------------------------------------------------------------------------
// posts
// -----------------------------------------------------------------------------

export async function savePost(form: FormData) {
  const supabase = await client();
  const id = str(form, 'id');
  const published = form.get('published') === 'on';

  const row = {
    slug: str(form, 'slug') ?? '',
    title: str(form, 'title') ?? '',
    excerpt: str(form, 'excerpt'),
    content_mdx: str(form, 'content_mdx'),
    cover_image: str(form, 'cover_image'),
    category: str(form, 'category'),
    reading_time: Number(str(form, 'reading_time') ?? 0) || null,
    published,
    published_at: published ? (str(form, 'published_at') ?? new Date().toISOString()) : null,
    seo_title: str(form, 'seo_title'),
    seo_description: str(form, 'seo_description'),
  };

  const { error } = id
    ? await supabase.from('posts').update(row).eq('id', id)
    : await supabase.from('posts').insert(row);
  if (error) throw new Error(error.message);

  revalidateTag(TAGS.posts);
  redirect('/admin/posts');
}

// -----------------------------------------------------------------------------
// testimonials
// -----------------------------------------------------------------------------

export async function toggleApproved(form: FormData) {
  const supabase = await client();
  const id = str(form, 'id');
  if (!id) return;
  const { error } = await supabase
    .from('testimonials')
    .update({ approved: form.get('next') === 'true' })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidateTag(TAGS.testimonials);
  revalidatePath('/admin/testimonials');
}

export async function saveTestimonial(form: FormData) {
  const supabase = await client();
  const row = {
    client_name: str(form, 'client_name') ?? '',
    business_name: str(form, 'business_name'),
    content: str(form, 'content') ?? '',
    rating: Number(str(form, 'rating') ?? 0) || null,
    // New reviews always land unapproved. Nothing reaches the public site
    // without a deliberate second action.
    approved: false,
    order_index: Number(str(form, 'order_index') ?? 0) || 0,
  };
  const { error } = await supabase.from('testimonials').insert(row);
  if (error) throw new Error(error.message);
  revalidateTag(TAGS.testimonials);
  revalidatePath('/admin/testimonials');
}
