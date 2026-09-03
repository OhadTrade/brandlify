'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { services } from '@/content/services';
import { emptyLead, leadSchema, type LeadInput, type LeadParsed } from '@/lib/leadSchema';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * The contact form, in a bordered panel.
 *
 * Validated by the same Zod schema the API route uses, so the browser and the
 * server can never disagree about what a valid lead is. The client side is
 * convenience only — everything is re-checked on the server.
 *
 * The reference layout pairs this panel with a value column and closes with a
 * privacy note; the page supplies those. What the reference does NOT get
 * carried over is its single-select "team size" — every field here is either
 * free text or a multiple choice backed by `services_interested text[]`, so a
 * Radix Select would have been a runtime dependency with nothing to select.
 */
export function LeadForm() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('idle');
  // Flipped in an effect, so it is only ever true once this component is live in
  // the browser. Guards against a native form submission before hydration —
  // which would put the visitor's name, phone and e-mail into the URL, the
  // browser history and any referrer header.
  const [hydrated, setHydrated] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const turnstileBox = useRef<HTMLDivElement>(null);
  const turnstileToken = useRef<string | undefined>(undefined);
  const widgetId = useRef<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
    // Three generics because the schema transforms: the form holds raw input
    // (LeadInput), the resolver hands the submit handler parsed output
    // (LeadParsed). Without the third, RHF and Zod disagree about e.g. email
    // being string|undefined versus string|null.
  } = useForm<LeadInput, unknown, LeadParsed>({
    resolver: zodResolver(leadSchema),
    defaultValues: emptyLead,
    mode: 'onTouched',
  });

  useEffect(() => setHydrated(true), []);

  // Turnstile renders itself once its script is on the page.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const tryRender = () => {
      if (!window.turnstile || !turnstileBox.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(turnstileBox.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        language: 'he',
        callback: (token: string) => {
          turnstileToken.current = token;
        },
        'expired-callback': () => {
          turnstileToken.current = undefined;
        },
      });
    };
    tryRender();
    const id = window.setInterval(tryRender, 400);
    return () => window.clearInterval(id);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setStatus('submitting');
    setServerError(null);

    const params = new URLSearchParams(window.location.search);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          source_page: pathname,
          utm_source: params.get('utm_source') ?? undefined,
          utm_medium: params.get('utm_medium') ?? undefined,
          utm_campaign: params.get('utm_campaign') ?? undefined,
          turnstileToken: turnstileToken.current,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          fields?: Record<string, string>;
        };
        if (body.fields) {
          for (const [key, message] of Object.entries(body.fields)) {
            setError(key as keyof LeadInput, { message });
          }
        }
        setServerError(body.error ?? 'משהו השתבש. אפשר להתקשר אלינו ישירות.');
        setStatus('error');
        window.turnstile?.reset(widgetId.current);
        turnstileToken.current = undefined;
        return;
      }

      // Conversion event for GA4. Guarded so a blocked analytics script cannot
      // break the success path.
      try {
        window.gtag?.('event', 'generate_lead', {
          currency: 'ILS',
          value: 0,
          form_location: pathname,
        });
      } catch {
        /* analytics is never load-bearing */
      }

      reset(emptyLead);
      setStatus('success');
    } catch {
      setServerError('אין חיבור לשרת כרגע. אפשר להתקשר אלינו ישירות.');
      setStatus('error');
    }
  });

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="arrive border-line bg-surface rounded-card flex flex-col items-center gap-5 border p-10 text-center"
      >
        <span
          aria-hidden
          className="bg-cta flex h-16 w-16 items-center justify-center rounded-full text-white"
        >
          <Icon name="check" className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h2 className="text-h3 text-fg">קיבלנו!</h2>
        <p className="text-muted max-w-sm text-[0.9375rem] leading-relaxed">
          נחזור אליך תוך 24 שעות בימי עסקים. אם זה דחוף — פשוט תתקשר, אנחנו עונים.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-pink text-sm font-semibold"
        >
          שליחת פנייה נוספת
        </button>
      </div>
    );
  }

  return (
    <>
      {TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="lazyOnload"
        />
      ) : null}

      {/* method="post" is belt and braces: if this form is ever submitted
          natively, the fields go in a request body rather than the query string. */}
      <form
        onSubmit={onSubmit}
        method="post"
        noValidate
        className="border-line bg-surface rounded-card space-y-7 border p-6 md:p-10"
      >
        {/* Honeypot. Hidden from people, irresistible to bots. */}
        <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
          <label htmlFor="company_website">אל תמלא שדה זה</label>
          <input
            id="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('company_website')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">
              שם מלא <span className="text-magenta">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="ישראל ישראלי"
              className="mt-2"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
            {errors.name ? (
              <p id="name-error" className="text-pink mt-1.5 text-sm">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="phone">
              טלפון <span className="text-magenta">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              placeholder="050-0000000"
              className="mt-2 text-start"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              {...register('phone')}
            />
            {errors.phone ? (
              <p id="phone-error" className="text-pink mt-1.5 text-sm">
                {errors.phone.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 text-start"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email ? (
              <p id="email-error" className="text-pink mt-1.5 text-sm">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="business_type">סוג העסק</Label>
            <Input
              id="business_type"
              type="text"
              placeholder="מספרה, מוסך, קליניקה…"
              className="mt-2"
              {...register('business_type')}
            />
          </div>
        </div>

        <fieldset>
          <legend className="text-fg mb-3 text-sm leading-none font-semibold">
            מה מעניין אותך?
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {services.map((service) => (
              <label
                key={service.slug}
                className="border-line text-muted rounded-btn hover:border-line-strong has-checked:border-magenta has-checked:text-fg ease-snap cursor-pointer border px-4 py-2.5 text-sm font-semibold transition-[color,border-color,background-color,scale] duration-200 active:scale-[0.97] active:duration-75 has-checked:bg-[rgb(230_53_240/0.08)] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <input
                  type="checkbox"
                  value={service.title}
                  className="sr-only"
                  {...register('services_interested')}
                />
                {service.title}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="message">ספר לנו על הפרויקט</Label>
          <Textarea
            id="message"
            rows={5}
            placeholder="מה העסק עושה, מה חסר לך היום, ולאן אתה רוצה להגיע."
            className="mt-2"
            aria-invalid={Boolean(errors.message)}
            {...register('message')}
          />
          {errors.message ? (
            <p className="text-pink mt-1.5 text-sm">{errors.message.message}</p>
          ) : null}
        </div>

        {TURNSTILE_SITE_KEY ? <div ref={turnstileBox} className="min-h-[65px]" /> : null}

        <div>
          <label htmlFor="consent" className="flex cursor-pointer items-start gap-3">
            {/*
              Native checkbox, drawn by us. accent-color was the obvious route
              and it is the wrong one here: once accent-color is set, Chrome
              derives the whole widget from it and the UNCHECKED box comes out
              pale grey, which on this dark panel reads as a disabled control.
              appearance-none plus our own tick keeps the native element — and
              its keyboard and screen-reader behaviour — while letting the box
              be dark.
            */}
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                id="consent"
                type="checkbox"
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? 'consent-error' : undefined}
                className="peer border-line bg-elevated checked:bg-cta h-5 w-5 appearance-none rounded-[4px] border transition-colors duration-200"
                {...register('consent')}
              />
              <Icon
                aria-hidden
                name="check"
                strokeWidth={3.5}
                className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
              />
            </span>
            <span className="text-muted text-sm leading-relaxed">
              אני מאשר/ת שתחזרו אליי בטלפון או במייל בעקבות הפנייה, ושקראתי את{' '}
              <Link href="/privacy" className="text-pink underline-offset-4 hover:underline">
                מדיניות הפרטיות
              </Link>
              . <span className="text-magenta">*</span>
            </span>
          </label>
          {errors.consent ? (
            <p id="consent-error" className="text-pink mt-1.5 text-sm">
              {errors.consent.message}
            </p>
          ) : null}
        </div>

        {serverError ? (
          <p role="alert" className="border-magenta text-pink rounded-btn border p-4 text-sm">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === 'submitting' || !hydrated}
          className="bg-cta rounded-btn font-heading shadow-glow-violet hover:shadow-glow-magenta ease-snap flex h-14 w-full items-center justify-center gap-2 text-lg font-bold text-white transition-[box-shadow,scale] duration-200 active:scale-[0.98] active:duration-75 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {status === 'submitting' ? 'שולח…' : hydrated ? 'שליחה' : 'טוען…'}
          {status === 'submitting' || !hydrated ? null : <Icon name="arrow" className="h-5 w-5" />}
        </button>

        <p className="text-muted text-xs leading-relaxed">
          בשליחת הטופס אתה מאשר שקראת את{' '}
          <Link href="/privacy" className="underline underline-offset-4">
            מדיניות הפרטיות
          </Link>{' '}
          שלנו. לא נשלח לך ספאם ולא נעביר את הפרטים לאף אחד.
        </p>
      </form>
    </>
  );
}
