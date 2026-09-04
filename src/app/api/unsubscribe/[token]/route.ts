import { NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/marketing';

/**
 * One-click unsubscribe, for mail clients.
 *
 * This endpoint exists because the campaign sets `List-Unsubscribe-Post:
 * List-Unsubscribe=One-Click`, and that header is a promise: a mail client may
 * POST to the URL and expect the recipient to be removed with no further
 * interaction. Gmail and others show their own "unsubscribe" button on the
 * strength of it, which is both the least friction for the recipient and a
 * deliverability signal.
 *
 * POST does the work. GET only redirects to the human page, deliberately:
 * link scanners and prefetchers issue GETs, and a GET that mutates would
 * quietly unsubscribe people who never clicked anything.
 */

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const ok = await unsubscribeByToken(token);
  // 200 even when the token matched nothing: a mail client cannot act on a
  // failure status, and a retry loop over an already-removed recipient helps
  // nobody. The body still says which it was, for a human debugging a link.
  return NextResponse.json({ ok }, { status: 200 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  // Resolved against the request, not against NEXT_PUBLIC_SITE_URL. The
  // configured base is the canonical host, so using it here would bounce
  // anyone who reached the endpoint on a preview or vercel.app URL over to
  // the production domain mid-flow.
  return NextResponse.redirect(new URL(`/unsubscribe/${token}`, request.url), 302);
}
