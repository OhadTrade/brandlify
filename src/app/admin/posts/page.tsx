import Link from 'next/link';
import { deleteRow, togglePublished } from '../actions';
import { Container } from '@/components/ui/Container';
import { createServerSupabase } from '@/lib/supabase/server';
import type { PostRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'מאמרים' };

export default async function AdminPostsPage() {
  const supabase = await createServerSupabase();
  const { data, error } = (await supabase
    ?.from('posts')
    .select('*')
    .order('created_at', { ascending: false })) ?? { data: null, error: null };

  const posts: PostRow[] = data ?? [];

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-fg">מאמרים</h1>
          <p className="text-muted mt-1 text-sm">{posts.length} מאמרים</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-cta rounded-btn font-heading flex h-11 items-center px-5 font-bold text-white"
        >
          מאמר חדש
        </Link>
      </div>

      {error ? (
        <p className="border-magenta text-pink rounded-card border p-4 text-sm">{error.message}</p>
      ) : null}

      {posts.length === 0 && !error ? (
        <div className="border-line rounded-card border border-dashed p-12 text-center">
          <p className="text-muted">אין מאמרים. מקטע המאמרים באתר מוסתר עד שיהיה אחד מפורסם.</p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="border-line bg-surface rounded-card flex flex-wrap items-center justify-between gap-4 border p-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-fg font-bold">{post.title}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    post.published
                      ? 'bg-[rgb(52_211_153/0.15)] text-[#6EE7B7]'
                      : 'text-muted bg-[rgb(250_250_252/0.06)]'
                  }`}
                >
                  {post.published ? 'מפורסם' : 'טיוטה'}
                </span>
              </div>
              <p className="text-muted mt-1 text-sm">
                {post.category ? `${post.category} · ` : ''}
                <span dir="ltr">/{post.slug}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/posts/${post.id}`}
                className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn border px-4 py-2 text-sm transition-colors"
              >
                עריכה
              </Link>

              <form action={togglePublished}>
                <input type="hidden" name="table" value="posts" />
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="next" value={String(!post.published)} />
                <button
                  type="submit"
                  className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn border px-4 py-2 text-sm transition-colors"
                >
                  {post.published ? 'להסתיר' : 'לפרסם'}
                </button>
              </form>

              <form action={deleteRow}>
                <input type="hidden" name="table" value="posts" />
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  className="text-muted hover:text-pink px-2 text-sm transition-colors"
                >
                  מחיקה
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
