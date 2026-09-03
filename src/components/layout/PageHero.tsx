import Link from 'next/link';
import type { ReactNode } from 'react';
import { TextReveal } from '@/components/motion/TextReveal';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { site } from '@/lib/site';

export type Crumb = { href: string; label: string };

/**
 * The opener every interior page shares: breadcrumb, eyebrow, H1, lead.
 *
 * Emits BreadcrumbList structured data from the same array that renders the
 * visible trail, so the two can never disagree.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs = [],
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  const trail: Crumb[] = [{ href: '/', label: 'דף הבית' }, ...crumbs];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      item: new URL(crumb.href, site.url).toString(),
    })),
  };

  return (
    <section className="border-line relative overflow-hidden border-b pt-14 pb-16 md:pt-20 md:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 start-1/4 h-[560px] w-[560px] rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgb(131 47 240 / 0.45), rgb(230 53 240 / 0.1) 50%, transparent 72%)',
        }}
      />

      <Container className="relative flex flex-col gap-6">
        <nav aria-label="מיקום באתר">
          <ol className="text-muted flex flex-wrap items-center gap-2 text-sm">
            {trail.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {i > 0 ? (
                  <span aria-hidden className="opacity-50">
                    /
                  </span>
                ) : null}
                {i === trail.length - 1 ? (
                  <span className="text-fg">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-fg transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {eyebrow ? (
          <p className="text-label font-latin text-magenta flex items-center gap-3 uppercase">
            <span aria-hidden className="bg-brand h-px w-8" />
            {eyebrow}
          </p>
        ) : null}

        <TextReveal as="h1" by="words" className="text-h1 text-fg max-w-4xl" duration={0.8}>
          {title}
        </TextReveal>

        {lead ? <p className="text-muted max-w-2xl text-[1.0625rem] leading-relaxed">{lead}</p> : null}

        {children}
      </Container>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

/** Shown where a data-driven list has nothing in it yet. */
export function EmptyState({
  title,
  body,
  ctaHref = '/contact',
  ctaLabel = 'דברו איתנו',
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="border-line rounded-card flex flex-col items-center gap-4 border border-dashed px-8 py-16 text-center">
      <h2 className="text-h3 text-fg">{title}</h2>
      <p className="text-muted max-w-md text-[0.9375rem] leading-relaxed">{body}</p>
      <Link
        href={ctaHref}
        className="text-pink mt-2 inline-flex items-center gap-2 text-sm font-semibold"
      >
        {ctaLabel}
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </div>
  );
}
