import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { FinalCta } from '@/components/sections/FinalCta';
import { Reveal } from '@/components/motion/Reveal';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { getServices } from '@/lib/queries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'שירותים',
  description:
    'בניית אתרים, מיתוג ועיצוב, שיווק דיגיטלי, קידום אורגני ואוטומציות — חמישה שירותים תחת ספק אחד.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="חמישה שירותים, ספק אחד."
        lead="במקום לתאם בין מעצב, מפתח ומשווק — הכול יושב במקום אחד, מדבר אותה שפה ומכוון לאותה מטרה."
        crumbs={[{ href: '/services', label: 'שירותים' }]}
      />

      <section className="section-y">
        <Container>
          <Reveal as="ul" className="grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <li key={service.slug} className="group">
                <Link
                  href={`/services/${service.slug}`}
                  className="border-line bg-surface rounded-card hover:border-line-strong hover:shadow-lift relative flex h-full flex-col gap-5 border p-8 transition-[translate,scale,border-color,box-shadow] duration-200 ease-snap active:scale-[0.99] active:duration-75 motion-reduce:active:scale-100 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <span
                    aria-hidden
                    className="bg-brand pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span
                    aria-hidden
                    className="border-line chamfer text-violet group-hover:text-magenta flex h-12 w-12 items-center justify-center border bg-[rgb(131_47_240/0.08)] transition-colors duration-300"
                  >
                    <Icon name={service.icon ?? 'globe'} className="h-6 w-6" />
                  </span>

                  <h2 className="text-h3 text-fg">{service.title}</h2>
                  <p className="text-muted text-[0.9375rem] leading-relaxed">
                    {service.short_desc}
                  </p>

                  {service.benefits.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {service.benefits.slice(0, 3).map((benefit) => (
                        <li
                          key={benefit}
                          className="border-line text-muted rounded-btn border px-3 py-1 text-xs"
                        >
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <span className="text-pink mt-auto flex items-center gap-2 text-sm font-semibold">
                    לעמוד השירות
                    <Icon
                      name="arrow"
                      className="h-4 w-4 transition-transform duration-200 ease-snap group-hover:-translate-x-1 motion-reduce:transform-none"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </Reveal>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
