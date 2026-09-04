import 'server-only';

import { Resend } from 'resend';
import { contact, site } from '@/lib/site';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * Advertising email, under section 30A of the Communications Law.
 *
 * The point of this file is that it is the only way to send a campaign, and it
 * refuses to send one that would break the section. Everything the law asks for
 * is enforced here rather than left to whoever writes the next campaign:
 *
 *   - prior consent      `marketableLeads` only returns leads that ticked the
 *                        second box, and never leads who opted out. There is no
 *                        exported function that sends to an arbitrary address.
 *   - the word פרסומת    prefixed to the subject, by this file, not by the
 *                        caller. A caller who forgets cannot forget.
 *   - who is sending     name, contact details and address, from `advertiser`
 *                        below. Missing details are a hard error, not a warning.
 *   - how to stop        a one-click link in the body and a List-Unsubscribe
 *                        header, both built from the lead's own token.
 *
 * Nothing here sends until RESEND_API_KEY exists. `sendCampaign` reports what
 * it would have done instead, which is also how it should be tested.
 */

/**
 * Who the advertisement is from.
 *
 * Section 30A(e)(2) asks for the advertiser's name, address and contact
 * details. Two of the three are known. The address is not, and rather than
 * inventing one or quietly omitting it, `assertAdvertiserComplete` below stops
 * the send. Setting MARKETING_SENDER_ADDRESS is the whole fix; a PO box or a
 * registered business address is fine, a home address is not obligatory to
 * publish anywhere else on the site.
 */
export const advertiser = {
  /** TODO(owner): the registered legal name, if it differs from the brand. */
  name: process.env.MARKETING_SENDER_NAME ?? site.name,
  /** TODO(owner): required before any campaign can go out. */
  address: process.env.MARKETING_SENDER_ADDRESS ?? null,
  email: process.env.LEAD_NOTIFICATION_EMAIL ?? contact.email,
  phone: contact.phoneDisplay,
} as const;

/** A lead that may lawfully be sent advertising right now. */
export type MarketableLead = {
  id: string;
  name: string;
  email: string;
  unsubscribe_token: string;
};

/** The human page, linked from the body of the message. */
export function unsubscribeUrl(token: string): string {
  return new URL(`/unsubscribe/${token}`, site.url).toString();
}

/**
 * The machine endpoint, for the List-Unsubscribe header.
 *
 * Separate from the page on purpose. The header promises that a POST to this
 * URL removes the recipient with no further interaction, and only a route
 * handler can accept that POST; the page asks for a confirming click, because
 * link scanners fetch every URL in a message and a mutating GET would
 * unsubscribe people who never clicked.
 */
export function unsubscribeEndpoint(token: string): string {
  return new URL(`/api/unsubscribe/${token}`, site.url).toString();
}

function assertAdvertiserComplete(): void {
  if (!advertiser.address) {
    throw new Error(
      'MARKETING_SENDER_ADDRESS is not set. Section 30A requires the advertiser’s ' +
        'address in every promotional message, so no campaign can be sent without it.',
    );
  }
}

/**
 * The identification and opt-out block, appended to every campaign.
 *
 * Kept as one function so there is a single place to change if the wording of
 * the section is ever read differently, and so no campaign can ship without it.
 */
export function complianceFooterHtml(token: string): string {
  assertAdvertiserComplete();
  const url = unsubscribeUrl(token);
  return `
  <hr style="margin:32px 0 20px;border:0;border-top:1px solid rgba(250,250,252,0.12);">
  <div style="font-size:12px;line-height:1.7;color:#9A94AC;">
    <p style="margin:0 0 8px;">
      הודעה זו נשלחה אליך מ${escapeHtml(advertiser.name)} משום שאישרת לקבל דיוור פרסומי
      בטופס באתר.
    </p>
    <p style="margin:0 0 8px;">
      ${escapeHtml(advertiser.name)} · ${escapeHtml(advertiser.address!)} ·
      <span dir="ltr">${escapeHtml(advertiser.phone)}</span> ·
      <a href="mailto:${escapeHtml(advertiser.email)}" dir="ltr" style="color:#F884EC;">${escapeHtml(advertiser.email)}</a>
    </p>
    <p style="margin:0;">
      <a href="${url}" style="color:#F884EC;">להסרה מרשימת התפוצה בלחיצה אחת</a>
    </p>
  </div>`;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/**
 * Everyone who may be sent advertising.
 *
 * Three conditions, all in the query rather than in a caller's filter:
 * consent was given, it has not been withdrawn, and there is an address to
 * send to. A lead who only ticked the first box on the form is not here and
 * cannot be made to appear here.
 */
export async function marketableLeads(): Promise<MarketableLead[]> {
  const supabase = getAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leads')
    .select('id, name, email, unsubscribe_token')
    .eq('marketing_consent', true)
    .is('unsubscribed_at', null)
    .not('email', 'is', null);

  if (error) {
    console.error('[marketing] could not list marketable leads', error);
    return [];
  }
  return (data ?? []) as MarketableLead[];
}

/** Records an opt-out. Returns false only when the token matches nothing. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const supabase = getAdminClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('leads')
    // The consent flag is deliberately left alone. It is the record that
    // permission was once given, and the section puts the burden of proving
    // that on the sender; `unsubscribed_at` is what suppresses sending.
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('id');

  if (error) {
    console.error('[marketing] unsubscribe failed', error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export type CampaignResult = {
  attempted: number;
  sent: number;
  failed: number;
  /** True when RESEND_API_KEY is absent, so nothing actually went out. */
  dryRun: boolean;
};

/**
 * Sends one campaign to everyone eligible.
 *
 * The subject is prefixed here and the footer is appended here, so a caller
 * supplies only the message. Sending is sequential and deliberately unhurried:
 * a campaign is not a request anybody is waiting on, and Resend rate-limits.
 */
export async function sendCampaign({
  subject,
  bodyHtml,
}: {
  /** Without the פרסומת prefix. This function adds it. */
  subject: string;
  /** The message itself. The identification and opt-out block is appended. */
  bodyHtml: string;
}): Promise<CampaignResult> {
  assertAdvertiserComplete();

  const recipients = await marketableLeads();
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? `${site.name} <no-reply@${new URL(site.url).hostname}>`;

  if (!key) {
    console.warn(
      `[marketing] dry run: would send "${subject}" to ${recipients.length} recipient(s)`,
    );
    return { attempted: recipients.length, sent: 0, failed: 0, dryRun: true };
  }

  const resend = new Resend(key);
  let sent = 0;
  let failed = 0;

  for (const lead of recipients) {
    const endpoint = unsubscribeEndpoint(lead.unsubscribe_token);
    try {
      const { error } = await resend.emails.send({
        from,
        to: lead.email,
        // The section wants the word at the start of the message. Putting it in
        // the subject is the only place a recipient reliably sees it before
        // deciding whether to open.
        subject: `פרסומת | ${subject}`,
        html: bodyHtml + complianceFooterHtml(lead.unsubscribe_token),
        headers: {
          // Lets a mail client offer its own unsubscribe button, which is both
          // a deliverability signal and one fewer step for the recipient.
          'List-Unsubscribe': `<${endpoint}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      if (error) throw error;
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error('[marketing] send failed', lead.id, error);
    }
  }

  return { attempted: recipients.length, sent, failed, dryRun: false };
}
