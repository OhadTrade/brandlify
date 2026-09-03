import 'server-only';

import { Resend } from 'resend';
import type { LeadParsed } from '@/lib/leadSchema';
import { contact, site } from '@/lib/site';

/**
 * Transactional email.
 *
 * Both messages are best-effort: a lead is already safely in the database
 * before either is attempted, so a Resend outage costs a notification, never
 * the lead itself. Failures are logged and reported back to the route, which
 * still answers the visitor with success.
 */

const FROM = `Brandlify <no-reply@${new URL(site.url).hostname.replace(/^www\./, '')}>`;

function client() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

function shell(title: string, body: string) {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${escape(title)}</title></head>
<body style="margin:0;background:#08060E;color:#F5F3F8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="height:4px;background:linear-gradient(135deg,#832FF0,#E635F0);border-radius:2px;margin-bottom:28px;"></div>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#9A94AC;">${escape(site.name)} · ${escape(site.url)}</p>
  </div>
</body></html>`;
}

/** Tells the owner a lead came in, with everything needed to call back. */
export async function sendOwnerNotification(lead: LeadParsed) {
  const resend = client();
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!resend || !to) return { sent: false, reason: 'not configured' as const };

  const rows: [string, string | null][] = [
    ['שם', lead.name],
    ['טלפון', lead.phone],
    ['אימייל', lead.email],
    ['סוג העסק', lead.business_type],
    ['שירותים', lead.services_interested.join(', ') || null],
    ['הגיע מהעמוד', lead.source_page],
    ['מקור קמפיין', [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ') || null],
  ];

  const html = shell(
    'פנייה חדשה',
    `<h1 style="margin:0 0 20px;font-size:22px;">פנייה חדשה מהאתר</h1>
     <table style="width:100%;border-collapse:collapse;font-size:15px;">
       ${rows
         .filter(([, value]) => value)
         .map(
           ([label, value]) =>
             `<tr><td style="padding:8px 0;color:#9A94AC;width:120px;">${escape(label)}</td><td style="padding:8px 0;">${escape(String(value))}</td></tr>`,
         )
         .join('')}
     </table>
     ${
       lead.message
         ? `<div style="margin-top:20px;padding:16px;background:#100C18;border-radius:8px;">
              <p style="margin:0 0 6px;color:#9A94AC;font-size:13px;">תיאור הפרויקט</p>
              <p style="margin:0;white-space:pre-line;font-size:15px;">${escape(lead.message)}</p>
            </div>`
         : ''
     }
     <p style="margin-top:24px;">
       <a href="tel:${escape(lead.phone)}" style="display:inline-block;background:#6B1FD4;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-weight:bold;">להתקשר עכשיו</a>
     </p>`,
  );

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      // Hitting reply in the mail client goes to the lead, not to no-reply.
      replyTo: lead.email ?? undefined,
      subject: `פנייה חדשה מהאתר — ${lead.name}`,
      html,
    });
    if (error) throw error;
    return { sent: true as const };
  } catch (error) {
    console.error('[email] owner notification failed', error);
    return { sent: false, reason: 'send failed' as const };
  }
}

/** Confirms to the visitor that the message arrived and when to expect a reply. */
export async function sendLeadConfirmation(lead: LeadParsed) {
  const resend = client();
  if (!resend || !lead.email) return { sent: false, reason: 'no address' as const };

  const html = shell(
    'קיבלנו את הפנייה',
    `<h1 style="margin:0 0 16px;font-size:22px;">קיבלנו את הפנייה שלך, ${escape(lead.name)} 👋</h1>
     <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#D6D2E0;">
       תודה שפנית אלינו. נחזור אליך תוך 24-48 שעות בימי עסקים — גם אם נגיע למסקנה שאנחנו לא הספק הנכון עבורך, נגיד לך את זה בכנות.
     </p>
     <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#D6D2E0;">
       אם זה דחוף, אפשר פשוט להתקשר: <a href="tel:${contact.phoneE164}" style="color:#F884EC;">${contact.phoneDisplay}</a>
       או לכתוב בוואטסאפ.
     </p>
     ${
       lead.message
         ? `<div style="margin-top:20px;padding:16px;background:#100C18;border-radius:8px;">
              <p style="margin:0 0 6px;color:#9A94AC;font-size:13px;">מה שכתבת לנו</p>
              <p style="margin:0;white-space:pre-line;font-size:14px;color:#D6D2E0;">${escape(lead.message)}</p>
            </div>`
         : ''
     }`,
  );

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: lead.email,
      replyTo: process.env.LEAD_NOTIFICATION_EMAIL,
      subject: 'קיבלנו את הפנייה שלך — Brandlify',
      html,
    });
    if (error) throw error;
    return { sent: true as const };
  } catch (error) {
    console.error('[email] lead confirmation failed', error);
    return { sent: false, reason: 'send failed' as const };
  }
}
