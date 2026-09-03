import Link from 'next/link';
import { deleteRow, togglePublished } from '../actions';
import { Container } from '@/components/ui/Container';
import { createServerSupabase } from '@/lib/supabase/server';
import type { ProjectRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'פרויקטים' };

export default async function AdminProjectsPage() {
  const supabase = await createServerSupabase();
  const { data, error } = (await supabase
    ?.from('projects')
    .select('*')
    .order('order_index')
    .order('created_at', { ascending: false })) ?? { data: null, error: null };

  const projects: ProjectRow[] = data ?? [];

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-fg">פרויקטים</h1>
          <p className="text-muted mt-1 text-sm">{projects.length} פרויקטים</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-cta rounded-btn font-heading flex h-11 items-center px-5 font-bold text-white"
        >
          פרויקט חדש
        </Link>
      </div>

      {error ? (
        <p className="border-magenta text-pink rounded-card border p-4 text-sm">{error.message}</p>
      ) : null}

      {projects.length === 0 && !error ? (
        <div className="border-line rounded-card border border-dashed p-12 text-center">
          <p className="text-muted">
            עדיין אין פרויקטים. עד שיהיה אחד מפורסם, מקטע העבודות לא מוצג באתר.
          </p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {projects.map((project) => (
          <li
            key={project.id}
            className="border-line bg-surface rounded-card flex flex-wrap items-center justify-between gap-4 border p-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-fg font-bold">{project.business_name}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    project.published
                      ? 'bg-[rgb(52_211_153/0.15)] text-[#6EE7B7]'
                      : 'text-muted bg-[rgb(250_250_252/0.06)]'
                  }`}
                >
                  {project.published ? 'מפורסם' : 'טיוטה'}
                </span>
                {project.featured ? (
                  <span className="text-pink rounded-full bg-[rgb(230_53_240/0.12)] px-2.5 py-0.5 text-xs font-semibold">
                    מודגש
                  </span>
                ) : null}
              </div>
              <p className="text-muted mt-1 text-sm">
                {project.category} · <span dir="ltr">/{project.slug}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/projects/${project.id}`}
                className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn border px-4 py-2 text-sm transition-colors"
              >
                עריכה
              </Link>

              <form action={togglePublished}>
                <input type="hidden" name="table" value="projects" />
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="next" value={String(!project.published)} />
                <button
                  type="submit"
                  className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn border px-4 py-2 text-sm transition-colors"
                >
                  {project.published ? 'להסתיר' : 'לפרסם'}
                </button>
              </form>

              <form action={deleteRow}>
                <input type="hidden" name="table" value="projects" />
                <input type="hidden" name="id" value={project.id} />
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
