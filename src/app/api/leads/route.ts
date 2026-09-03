import { NextResponse } from 'next/server';
import { sendLeadConfirmation, sendOwnerNotification } from '@/lib/email';
import { leadSchema } from '@/lib/leadSchema';
import { callerKey, checkRateLimit } from '@/lib/rateLimit';
import { getAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lead intake.
 *
 * Order matters: the cheap rejections come first so a flood costs almost
 * nothing, and the database write happens before either email so a mail outage
 * can never lose a lead.
 *
 *   1. rate limit      per hashed IP, in memory
 *   2. schema          the same Zod object the form uses
 *   3. honeypot        a field only a bot fills in
 *   4. Turnstile       when configured
 *   5. insert          service role, server side only
 *   6. emails          best effort, failures logged not surfaced
 *
 * The honeypot answers 200 rather than an error: telling a bot it was caught
 * only teaches it to try again differently.
 */

async function verifyTurnstile(token: string | null | undefined, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, skipped: false };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return { ok: Boolean(data.success), skipped: false };
  } catch (error) {
    console.error('[leads] turnstile verification failed', error);
    // Cloudflare being unreachable must not block a genuine enquiry.
    return { ok: true, skipped: true };
  }
}

export async function POST(request: Request) {
  const key = await callerKey(request);
  const limit = checkRateLimit(key);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'יותר מדי פניות. נסה שוב בעוד שעה, או פשוט התקשר אלינו.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'חלק מהפרטים אינם תקינים',
        fields: Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0] ?? '_'), issue.message]),
        ),
      },
      { status: 422 },
    );
  }

  const lead = parsed.data;

  // Honeypot: silently accept and drop.
  if (lead.company_website && lead.company_website.trim() !== '') {
    console.warn('[leads] honeypot triggered');
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const turnstile = await verifyTurnstile(lead.turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      { error: 'לא הצלחנו לאמת שאתה לא רובוט. רענן את העמוד ונסה שוב.' },
      { status: 403 },
    );
  }

  const supabase = getAdminClient();
  if (!supabase) {
    console.error('[leads] SUPABASE_SERVICE_ROLE_KEY is not configured');
    return NextResponse.json(
      { error: 'הטופס אינו זמין כרגע. אפשר להתקשר אלינו ישירות.' },
      { status: 503 },
    );
  }

  const { error } = await supabase.from('leads').insert({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    business_type: lead.business_type,
    services_interested: lead.services_interested,
    message: lead.message,
    consent: true,
    source_page: lead.source_page,
    utm_source: lead.utm_source,
    utm_medium: lead.utm_medium,
    utm_campaign: lead.utm_campaign,
  });

  if (error) {
    console.error('[leads] insert failed', error);
    return NextResponse.json(
      { error: 'משהו השתבש בשמירת הפנייה. אפשר להתקשר אלינו ישירות.' },
      { status: 500 },
    );
  }

  // The lead is safe from here on. Email is a nicety; never fail the request.
  const [owner, confirmation] = await Promise.all([
    sendOwnerNotification(lead),
    sendLeadConfirmation(lead),
  ]);

  return NextResponse.json({
    ok: true,
    notified: owner.sent,
    confirmed: confirmation.sent,
  });
}
