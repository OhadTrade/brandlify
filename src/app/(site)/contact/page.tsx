import type { Metadata } from 'next';
import { LeadForm } from '@/components/contact/LeadForm';
import { PageHero } from '@/components/layout/PageHero';
import styles from '@/components/sections/studio-pages.module.css';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { services } from '@/content/services';
import { siteContent } from '@/content/site-content';
import { contact, site, whatsappUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'צור קשר',
  description: 'שיחת אפיון קצרה וללא עלות. נבין מה העסק שלך צריך ונגיד בכנות אם ואיך אנחנו יכולים לעזור.',
  alternates: { canonical: '/contact' },
};

const channels = [
  { key: 'phone', label: 'טלפון', value: contact.phoneDisplay, href: `tel:${contact.phoneE164}`, note: 'ראשון–חמישי, 09:00–18:00', icon: 'arrow' as const },
  { key: 'whatsapp', label: 'וואטסאפ', value: 'שליחת הודעה', href: whatsappUrl(), note: 'בדרך כלל התשובה המהירה ביותר', icon: 'whatsapp' as const },
  { key: 'email', label: 'אימייל', value: contact.email, href: `mailto:${contact.email}`, note: 'לפניות מפורטות ולקבצים', icon: 'external' as const },
];

const steps = [
  'נחזור אליך תוך 24-48 שעות בימי עסקים.',
  'שיחת אפיון של 20-30 דקות, ללא עלות וללא התחייבות.',
  'הצעת מחיר סגורה עם פירוט מה כלול ומה לא.',
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const query = await searchParams;
  const selectedService = typeof query.service === 'string'
    ? services.find((service) => service.slug === query.service)
    : undefined;
  const promises = siteContent['home.promises'];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'צור קשר',
    url: new URL('/contact', site.url).toString(),
    mainEntity: {
      '@type': 'Organization', name: site.name, url: site.url,
      telephone: contact.phoneE164, email: contact.email,
      areaServed: 'IL', availableLanguage: ['he'],
    },
  };

  return (
    <>
      <PageHero
        eyebrow="Let's build what's next"
        title="הצעד הבא מתחיל בשיחה."
        lead="שיחה קצרה, בלי התחייבות ובלי מצגות. נבין מה העסק צריך, ונגיד בכנות אם ואיך אנחנו יכולים לעזור."
        crumbs={[{ href: '/contact', label: 'צור קשר' }]}
      />

      <section className="section-y" aria-label="פנייה ל-Brandlify">
        <Container className={styles.contactLayout}>
          <div>
            {selectedService ? (
              <p className={styles.contactNote}>
                הגעת בנוגע ל{selectedService.title}. סימנו את התחום בטופס ואפשר לשנות או להוסיף שירותים.
              </p>
            ) : null}
            <LeadForm initialService={selectedService?.title} />
          </div>
          <aside className={styles.contactAside} aria-label="פרטי קשר והמשך התהליך">
            <div>
              <h2 className={styles.contactHeading}>מעדיפים לדבר ישירות?</h2>
              <ul className={styles.channels}>
                {channels.map((channel) => (
                  <li key={channel.key}>
                    <a href={channel.href} {...(channel.key === 'whatsapp' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      <Icon name={channel.icon} />
                      <span>
                        <small>{channel.label}</small>
                        <strong dir={channel.key === 'whatsapp' ? undefined : 'ltr'}>{channel.value}</strong>
                        <small>{channel.note}</small>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={styles.contactHeading}>ומה קורה אחרי השליחה?</h2>
              <ol className={styles.contactSteps}>
                {steps.map((step, index) => <li key={step}><span aria-hidden>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}
              </ol>
            </div>
          </aside>
        </Container>
      </section>

      <section className="section-y border-line border-t bg-surface" aria-labelledby="contact-promises-heading">
        <Container className={styles.split}>
          <h2 id="contact-promises-heading" className="text-h2 text-fg">{promises.title}</h2>
          <ul className={styles.commitments}>
            {promises.items.map((item) => (
              <li key={item.title}>
                <Icon name="check" className="h-5 w-5" />
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
