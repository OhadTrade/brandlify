import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ServiceArtwork } from '@/components/sections/ServiceArtwork';
import editorial from '@/components/sections/editorial.module.css';
import { services as serviceContent } from '@/content/services';
import { getPublishedProjects, getServiceBySlug, getServices } from '@/lib/queries';

export const revalidate = 300;

/** Slugs come from the canonical content, so the routes exist even if the
 *  database is unreachable at build time. */
export function generateStaticParams() {
  return serviceContent.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: 'שירות לא נמצא' };
  return {
    title: service.title,
    description: service.short_desc,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: `${service.title} | Brandlify`, description: service.short_desc },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, allServices, projects] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getPublishedProjects(),
  ]);

  if (!service) notFound();

  const related = projects.filter((p) => p.services.includes(service.title)).slice(0, 3);
  const others = allServices.filter((s) => s.slug !== service.slug);

  return (
    <>
      <PageHero
        eyebrow={service.title}
        title={service.title}
        lead={service.short_desc}
        visual={<ServiceArtwork slug={service.slug} priority />}
        crumbs={[
          { href: '/services', label: 'שירותים' },
          { href: `/services/${service.slug}`, label: service.title },
        ]}
      >
        <div className="flex flex-wrap gap-4 pt-2">
          <Button href={`/contact?service=${encodeURIComponent(service.slug)}`} size="lg">
            לשיחת אפיון ללא עלות
            <Icon name="arrow" className="h-5 w-5" />
          </Button>
        </div>
      </PageHero>

      {/* What it is */}
      {service.full_content ? (
        <section className="section-y" aria-labelledby="what-heading">
          <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <SectionHeading eyebrow="The bigger picture" id="what-heading" title="הבסיס לשלב הבא בעסק." className={editorial.serviceOverview} />
            {/*
              Paragraphs, not one block. The copy grew from a single sentence
              into a real explanation, and a wall of eight lines with no breaks
              is the fastest way to make sure nobody reads it. Blank lines in
              the stored text are the paragraph breaks.
            */}
            <div className="flex flex-col gap-4">
              {service.full_content
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph) => (
                  <p key={paragraph} className="text-muted text-[1.0625rem] leading-relaxed">
                    {paragraph}
                  </p>
                ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* What you get */}
      {service.benefits.length > 0 ? (
        <section
          className="section-y bg-surface border-line border-y"
          aria-labelledby="benefits-heading"
        >
          <Container className="flex flex-col gap-12">
            <SectionHeading eyebrow="What you get" id="benefits-heading" title="מה מקבלים" />
            <Reveal as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="border-line bg-elevated rounded-card flex items-start gap-3 border p-6"
                >
                  <span
                    aria-hidden
                    className="bg-cta mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                  >
                    <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-fg text-[0.9375rem] leading-relaxed">{benefit}</span>
                </li>
              ))}
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* Process */}
      {service.process_steps.length > 0 ? (
        <section className="section-y" aria-labelledby="steps-heading">
          <Container className="flex flex-col gap-12">
            <SectionHeading eyebrow="The process" id="steps-heading" title="איך זה עובד" />
            <Reveal as="ol" className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
              {service.process_steps.map((step, i) => (
                <li
                  key={step.title}
                  className="bg-surface relative overflow-hidden p-8 outline outline-[color:var(--color-line)]"
                >
                  <span
                    aria-hidden
                    className="font-latin text-muted pointer-events-none absolute top-5 end-6 text-[3.5rem] leading-none font-extrabold opacity-[0.08] select-none"
                    dir="ltr"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative flex flex-col gap-3">
                    <span aria-hidden className="bg-brand h-1 w-10 rounded-full" />
                    <h3 className="text-fg text-lg font-extrabold">{step.title}</h3>
                    <p className="text-muted text-[0.9375rem] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* Examples — only when there is real work tagged with this service. */}
      {related.length > 0 ? (
        <section
          className="section-y bg-surface border-line border-y"
          aria-labelledby="examples-heading"
        >
          <Container className="flex flex-col gap-12">
            <SectionHeading eyebrow="Examples" id="examples-heading" title="דוגמאות" />
            <Reveal as="ul" className="grid gap-6 md:grid-cols-3">
              {related.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="border-line bg-elevated rounded-card hover:border-line-strong block h-full border p-6 transition-colors"
                  >
                    <p className="text-label font-latin text-magenta uppercase">
                      {project.category}
                    </p>
                    <h3 className="text-h3 text-fg mt-2">{project.business_name}</h3>
                  </Link>
                </li>
              ))}
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* Service FAQ */}
      {service.faq.length > 0 ? (
        <section className="section-y" aria-labelledby="service-faq-heading">
          <Container className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="lg:w-2/5">
              <SectionHeading eyebrow="FAQ" id="service-faq-heading" title="שאלות נפוצות" />
            </div>
            <div className="border-line divide-line divide-y border-y lg:w-3/5">
              {service.faq.map((item) => (
                <details key={item.question} className="group">
                  <summary className="text-fg flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-start text-lg font-bold [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      aria-hidden
                      className="border-line text-violet group-open:bg-cta group-open:border-magenta mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 group-open:text-white"
                    >
                      <Icon
                        name="plus"
                        className="h-4 w-4 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                        strokeWidth={2}
                      />
                    </span>
                  </summary>
                  <p className="text-muted pb-6 pe-14 text-[0.9375rem] leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </Container>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: service.faq.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: { '@type': 'Answer', text: item.answer },
                })),
              }),
            }}
          />
        </section>
      ) : null}

      {/* Other services */}
      {others.length > 0 ? (
        <section className="border-line border-t py-16" aria-labelledby="others-heading">
          <Container className="flex flex-col gap-6">
            <h2 id="others-heading" className="text-label font-latin text-muted uppercase">
              שירותים נוספים
            </h2>
            <ul className="flex flex-wrap gap-3">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/services/${other.slug}`}
                    className="border-line text-fg rounded-btn hover:border-magenta hover:shadow-glow-magenta flex items-center gap-2 border px-5 py-3 text-sm font-semibold transition-[border-color,box-shadow] duration-200 ease-snap"
                  >
                    {other.title}
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <FinalCta />
    </>
  );
}
