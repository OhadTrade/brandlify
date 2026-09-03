import { z } from 'zod';
import { services } from '@/content/services';

/**
 * One schema, used by the browser and the server.
 *
 * The client uses it for inline validation; the API route parses the request
 * body with the same object before anything touches the database. Client-side
 * validation is a convenience, never a control — a request that skips the form
 * entirely meets exactly the same rules here.
 *
 * Every optional field is .nullish() rather than .optional() so the schema can
 * re-parse its own output. The browser posts the PARSED values, in which an
 * empty optional is null; .optional() accepts undefined but rejects null, so the
 * server would reject every message the client had just called valid.
 */

const SERVICE_TITLES = services.map((service) => service.title);

/** Israeli mobile and landline numbers, with or without separators. */
const PHONE_RE = /^(?:\+972|972|0)(?:[23489]|5\d|7\d)\d{7}$/;

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'שם קצר מדי')
    .max(80, 'שם ארוך מדי'),

  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-()]/g, ''))
    .refine((value) => PHONE_RE.test(value), 'מספר טלפון לא תקין'),

  email: z
    .union([z.string().trim().email('כתובת אימייל לא תקינה'), z.literal('')])
    .nullish()
    .transform((value) => value || null),

  business_type: z.string().trim().max(80, 'ארוך מדי').nullish().transform((v) => v || null),

  services_interested: z
    .array(z.string())
    .max(10)
    .nullish()
    .transform((value) => (value ?? []).filter((s) => SERVICE_TITLES.includes(s))),

  message: z
    .string()
    .trim()
    .max(2000, 'התיאור ארוך מדי')
    .nullish()
    .transform((v) => v || null),

  // The checkbox is the legal basis for holding the data. It is a boolean the
  // visitor has to turn on themselves — never pre-ticked, which would not be
  // consent at all — and the database has a matching CHECK so a lead without it
  // cannot be stored even if this layer were bypassed.
  consent: z
    .boolean()
    .refine((value) => value === true, 'צריך לאשר את מדיניות הפרטיות כדי שנוכל לחזור אליך'),

  // Context, collected silently.
  source_page: z.string().max(300).nullish().transform((v) => v || null),
  utm_source: z.string().max(120).nullish().transform((v) => v || null),
  utm_medium: z.string().max(120).nullish().transform((v) => v || null),
  utm_campaign: z.string().max(200).nullish().transform((v) => v || null),

  /** Honeypot. Real people never see this field, so anything in it is a bot. */
  company_website: z.string().max(200).nullish(),

  /** Cloudflare Turnstile token, when Turnstile is configured. */
  turnstileToken: z.string().max(4096).nullish(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadParsed = z.output<typeof leadSchema>;

/** Form-shaped defaults for react-hook-form. */
export const emptyLead: LeadInput = {
  name: '',
  phone: '',
  email: '',
  business_type: '',
  services_interested: [],
  message: '',
  consent: false,
  company_website: '',
};
