import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { contact, legalItems, navItems, services, site, socialLinks, whatsappUrl } from '@/lib/site';

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-label font-latin text-muted mb-5 uppercase">{children}</h2>
  );
}

const linkClass = 'text-muted hover:text-fg transition-colors duration-200';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-line bg-surface border-t">
      {/* Signature gradient hairline. */}
      <div aria-hidden className="bg-brand h-px w-full opacity-60" />

      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pe-8">
            <Link href="/" aria-label="Brandlify — לדף הבית" className="inline-block">
              <Logo variant="stacked" width={168} />
            </Link>
            <p className="text-muted mt-6 max-w-xs text-[0.9375rem] leading-relaxed">
              {site.tagline}. בניית אתרים, מיתוג, שיווק דיגיטלי, SEO ואוטומציות — במקום אחד.
            </p>
            {socialLinks.length > 0 ? (
              <ul className="mt-7 flex gap-3">
                {socialLinks.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="border-line text-muted rounded-btn hover:border-magenta hover:text-fg hover:shadow-glow-magenta flex h-11 w-11 items-center justify-center border transition-[color,border-color,box-shadow] duration-200 ease-snap"
                    >
                      <SocialIcon platform={s.platform} className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label="ניווט בתחתית האתר">
            <ColumnTitle>תפריט</ColumnTitle>
            <ul className="space-y-3 text-[0.9375rem]">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="השירותים שלנו">
            <ColumnTitle>שירותים</ColumnTitle>
            <ul className="space-y-3 text-[0.9375rem]">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className={linkClass}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColumnTitle>צור קשר</ColumnTitle>
            <ul className="space-y-3 text-[0.9375rem]">
              <li>
                <a href={`tel:${contact.phoneE164}`} className={linkClass}>
                  <span dir="ltr">{contact.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className={linkClass}>
                  <span dir="ltr">{contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  שליחת הודעה בוואטסאפ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-line mt-14 flex flex-col gap-4 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-muted text-sm">
            © {year} {site.name}. כל הזכויות שמורות.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {legalItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
