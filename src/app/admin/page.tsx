import Link from 'next/link';
import { deleteLead, updateLead } from './actions';
import { Container } from '@/components/ui/Container';
import type { LeadRow, LeadStatus } from '@/lib/supabase/types';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'לידים' };

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'חדש',
  contacted: 'יצרנו קשר',
  qualified: 'רלוונטי',
  won: 'נסגר',
  lost: 'לא רלוונטי',
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: 'bg-[rgb(230_53_240/0.15)] text-pink',
  contacted: 'bg-[rgb(131_47_240/0.15)] text-violet',
  qualified: 'bg-[rgb(131_47_240/0.22)] text-fg',
  won: 'bg-[rgb(52_211_153/0.15)] text-[#6EE7B7]',
  lost: 'bg-[rgb(250_250_252/0.06)] text-muted',
};

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filter } = await searchParams;
  const supabase = await createServerSupabase();

  let leads: LeadRow[] = [];
  let error: string | null = null;

  if (!supabase) {
    error = 'Supabase לא מוגדר.';
  } else {
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (filter && filter in STATUS_LABELS) query = query.eq('status', filter as LeadStatus);
    const result = await query;
    if (result.error) error = result.error.message;
    else leads = result.data ?? [];
  }

  const counts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-fg">לידים</h1>
          <p className="text-muted mt-1 text-sm">
            {filter ? `מסונן: ${STATUS_LABELS[filter as LeadStatus]} · ` : ''}
            {leads.length} פניות
          </p>
        </div>

        <nav aria-label="סינון לפי סטטוס">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href="/admin"
                className={`rounded-btn border px-3 py-1.5 text-sm transition-colors ${
                  filter ? 'border-line text-muted hover:text-fg' : 'border-magenta text-fg'
                }`}
              >
                הכול
              </Link>
            </li>
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((key) => (
              <li key={key}>
                <Link
                  href={`/admin?status=${key}`}
                  className={`rounded-btn border px-3 py-1.5 text-sm transition-colors ${
                    filter === key ? 'border-magenta text-fg' : 'border-line text-muted hover:text-fg'
                  }`}
                >
                  {STATUS_LABELS[key]}
                  {counts[key] ? ` (${counts[key]})` : ''}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {error ? (
        <p className="border-magenta text-pink rounded-card border p-4 text-sm">
          לא הצלחנו לטעון את הפניות: {error}
        </p>
      ) : null}

      {!error && leads.length === 0 ? (
        <div className="border-line rounded-card border border-dashed p-12 text-center">
          <p className="text-muted">אין פניות להצגה.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {leads.map((lead) => (
          <article key={lead.id} className="border-line bg-surface rounded-card border p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-fg text-lg font-extrabold">{lead.name}</h2>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_TONE[lead.status]}`}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                </div>

                <p className="text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <a href={`tel:${lead.phone}`} className="hover:text-fg" dir="ltr">
                    {lead.phone}
                  </a>
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="hover:text-fg" dir="ltr">
                      {lead.email}
                    </a>
                  ) : null}
                  {lead.business_type ? <span>{lead.business_type}</span> : null}
                  <time dateTime={lead.created_at}>
                    {dateFormatter.format(new Date(lead.created_at))}
                  </time>
                </p>

                {lead.services_interested.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {lead.services_interested.map((service) => (
                      <li
                        key={service}
                        className="border-line text-muted rounded-btn border px-2.5 py-1 text-xs"
                      >
                        {service}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {lead.message ? (
                  <p className="text-muted bg-elevated rounded-card mt-3 max-w-2xl p-4 text-sm leading-relaxed whitespace-pre-line">
                    {lead.message}
                  </p>
                ) : null}

                {lead.source_page || lead.utm_source ? (
                  <p className="text-muted mt-3 text-xs opacity-70" dir="ltr">
                    {[lead.source_page, lead.utm_source, lead.utm_medium, lead.utm_campaign]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-3">
                <form action={updateLead} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={lead.id} />
                  <label htmlFor={`status-${lead.id}`} className="sr-only">
                    סטטוס
                  </label>
                  <select
                    id={`status-${lead.id}`}
                    name="status"
                    defaultValue={lead.status}
                    className="border-line bg-elevated text-fg rounded-btn border px-3 py-2 text-sm"
                  >
                    {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((key) => (
                      <option key={key} value={key}>
                        {STATUS_LABELS[key]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn border px-3 py-2 text-sm transition-colors"
                  >
                    עדכון
                  </button>
                </form>

                <form action={deleteLead}>
                  <input type="hidden" name="id" value={lead.id} />
                  <button
                    type="submit"
                    className="text-muted hover:text-pink w-full text-xs transition-colors"
                  >
                    מחיקה
                  </button>
                </form>
              </div>
            </div>

            <form action={updateLead} className="border-line mt-5 flex gap-2 border-t pt-4">
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="status" value={lead.status} />
              <label htmlFor={`notes-${lead.id}`} className="sr-only">
                הערות פנימיות
              </label>
              <input
                id={`notes-${lead.id}`}
                name="notes"
                defaultValue={lead.notes ?? ''}
                placeholder="הערות פנימיות…"
                className="border-line bg-elevated text-fg rounded-btn flex-1 border px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="border-line text-muted hover:text-fg rounded-btn border px-4 py-2 text-sm transition-colors"
              >
                שמירה
              </button>
            </form>
          </article>
        ))}
      </div>
    </Container>
  );
}
