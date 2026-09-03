import type { Metadata } from 'next';
import { LeadForm } from '@/components/contact/LeadForm';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { siteContent } from '@/content/site-content';
import { contact, site, whatsappUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'צור קשר',
  description:
    'שיחת אפיון קצרה וללא עלות. נבין מה העסק שלך צריך ונגיד בכנות אם ואיך אנחנו יכולים לעזור.',
  alternates: { canonical: '/contact' },
};

const channels = [
  {
    key: 'phone',
    label: 'טלפון',
    value: contact.phoneDisplay,
    href: `tel:${contact.phoneE164}`,
    note: 'ראשון–חמישי, 09:00–18:00',
    icon: 'arrow' as const,
  },
  {
    key: 'whatsapp',
    label: 'וואטסאפ',
    value: 'שליחת הודעה',
    href: whatsappUrl(),
    note: 'בדרך כלל התשובה המהירה ביותר',
    icon: 'whatsapp' as const,
  },
  {
    key: 'email',
    label: 'אימייל',
    value: contact.email,
    href: `mailto:${contact.email}`,
    note: 'לפניות מפורטות ולקבצים',
    icon: 'external' as const,
  },
];

const steps = [
  'נחזור אליך תוך 24-48 שעות בימי עסקים.',
  'שיחת אפיון של 20-30 דקות, ללא עלות וללא התחייבות.',
  'הצעת מחיר סגורה עם פירוט מה כלול ומה לא.',
];

export default function ContactPage() {
  // The value column is the real, written commitments from the home page —
  // deliberately in place of the reference layout's "trusted by 10,000+" logo
  // wall, which would be social proof we do not have.
  const promises = siteContent['home.promises'];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'צור קשר',
    url: new URL('/contact', site.url).toString(),
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      url: site.url,
      telephone: contact.phoneE164,
      email: contact.email,
      areaServed: 'IL',
      availableLanguage: ['he'],
    },
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="בואו נדבר."
        lead="שיחה קצרה, בלי התחייבות ובלי מצגות. נבין מה אתה צריך, ונגיד לך בכנות אם ואיך אנחנו יכולים לעזור."
        crumbs={[{ href: '/contact', label: 'צור קשר' }]}
      />

      <section className="section-y">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-start lg:gap-16">
            {/* Value column. Sticks alongside the form on desktop, where the form
                is the taller of the two. */}
            <div className="flex flex-col gap-10 lg:sticky lg:top-28">
              <div>
                <h2 className="text-h3 text-fg">{promises.title}</h2>
                <p className="text-muted mt-3 text-[0.9375rem] leading-relaxed">
                  {promises.subtitle}
                </p>

                <ul className="mt-7 flex flex-col gap-5">
                  {promises.items.map((item) => (
                    <li key={item.title} className="flex gap-3.5">
                      <span
                        aria-hidden
                        className="bg-cta mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                      >
                        <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span>
                        <span className="text-fg block font-bold">{item.title}</span>
                        <span className="text-muted mt-1 block text-sm leading-relaxed">
                          {item.description}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-line rounded-card border p-6">
                <h3 className="text-fg mb-4 font-extrabold">מה קורה אחרי שתשלח?</h3>
                <ol className="text-muted space-y-3 text-[0.9375rem] leading-relaxed">
                  {steps.map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="text-brand-gradient font-latin font-extrabold" dir="ltr">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <LeadForm />
          </div>

          {/* Everyone who would rather not fill in a form. */}
          <ul className="border-line mt-16 grid gap-4 border-t pt-10 sm:grid-cols-3">
            {channels.map((channel) => (
              <li key={channel.key}>
                <a
                  href={channel.href}
                  {...(channel.key === 'whatsapp'
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="group flex items-center gap-4"
                >
                  <span
                    aria-hidden
                    className="border-line chamfer text-violet group-hover:text-magenta flex h-11 w-11 shrink-0 items-center justify-center border bg-[rgb(131_47_240/0.08)] transition-colors"
                  >
                    <Icon name={channel.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="text-label font-latin text-muted block uppercase">
                      {channel.label}
                    </span>
                    <span
                      className="text-fg group-hover:text-pink mt-0.5 block font-bold transition-colors"
                      dir="ltr"
                    >
                      {channel.value}
                    </span>
                    <span className="text-muted mt-0.5 block text-xs">{channel.note}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
