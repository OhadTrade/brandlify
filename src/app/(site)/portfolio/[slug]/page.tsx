import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getProjectBySlug, getPublishedProjects } from '@/lib/queries';

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'פרויקט לא נמצא' };
  const description = project.description ?? `${project.business_name} — ${project.category}`;
  return {
    title: project.business_name,
    description,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: `${project.business_name} | Brandlify`,
      description,
      images: project.cover_image ? [{ url: project.cover_image }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProjectBySlug(slug), getPublishedProjects()]);

  // RLS hides unpublished rows from the anon key, so a draft 404s for the public.
  if (!project || !project.published) notFound();

  const index = all.findIndex((p) => p.id === project.id);
  const next = index >= 0 ? all[(index + 1) % all.length] : undefined;

  const blocks = [
    { key: 'challenge', label: 'האתגר', value: project.challenge },
    { key: 'solution', label: 'הפתרון', value: project.solution },
    { key: 'results', label: 'התוצאות', value: project.results },
  ].filter((block) => Boolean(block.value));

  return (
    <>
      <PageHero
        eyebrow={project.category}
        title={project.business_name}
        lead={project.description ?? undefined}
        crumbs={[
          { href: '/portfolio', label: 'עבודות' },
          { href: `/portfolio/${project.slug}`, label: project.business_name },
        ]}
      >
        {project.services.length > 0 ? (
          <ul className="flex flex-wrap gap-2 pt-2">
            {project.services.map((service) => (
              <li
                key={service}
                className="text-pink rounded-full bg-[rgb(230_53_240/0.12)] px-4 py-1.5 text-sm font-semibold"
              >
                {service}
              </li>
            ))}
          </ul>
        ) : null}

        {project.live_url ? (
          <div className="pt-4">
            <Button href={project.live_url} target="_blank" rel="noopener noreferrer" size="lg">
              <Icon name="external" className="h-5 w-5" />
              לאתר החי
            </Button>
          </div>
        ) : null}
      </PageHero>

      {project.cover_image ? (
        <section className="border-line border-b">
          <Container className="py-10 md:py-14">
            <div className="border-line rounded-card bg-base relative aspect-[16/9] overflow-hidden border">
              <Image
                src={project.cover_image}
                alt={`${project.business_name} — תצוגה של הפרויקט`}
                fill
                priority
                sizes="(min-width: 1280px) 1232px, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        </section>
      ) : null}

      {blocks.length > 0 ? (
        <section className="section-y" aria-labelledby="story-heading">
          <Container className="flex flex-col gap-12">
            <SectionHeading eyebrow="Case study" id="story-heading" title="הסיפור המלא" />
            <Reveal as="div" className="grid gap-px lg:grid-cols-3">
              {blocks.map((block) => (
                <article
                  key={block.key}
                  className="bg-surface flex flex-col gap-4 p-8 outline outline-[color:var(--color-line)]"
                >
                  <h3 className="text-h3 text-brand-gradient">{block.label}</h3>
                  <p className="text-muted text-[0.9375rem] leading-relaxed whitespace-pre-line">
                    {block.value}
                  </p>
                </article>
              ))}
            </Reveal>
          </Container>
        </section>
      ) : null}

      {project.gallery.length > 0 ? (
        <section
          className="section-y bg-surface border-line border-y"
          aria-labelledby="gallery-heading"
        >
          <Container className="flex flex-col gap-12">
            <SectionHeading eyebrow="Gallery" id="gallery-heading" title="גלריה" />
            <Reveal as="ul" className="grid gap-5 sm:grid-cols-2">
              {project.gallery.map((src, i) => (
                <li
                  key={src}
                  className="border-line rounded-card bg-base relative aspect-[4/3] overflow-hidden border"
                >
                  <Image
                    src={src}
                    alt={`${project.business_name} — תמונה ${i + 1}`}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </Reveal>
          </Container>
        </section>
      ) : null}

      {next && next.id !== project.id ? (
        <section className="border-line border-t py-16" aria-labelledby="next-heading">
          <Container>
            <h2 id="next-heading" className="text-label font-latin text-muted mb-5 uppercase">
              הפרויקט הבא
            </h2>
            <Link
              href={`/portfolio/${next.slug}`}
              className="group border-line rounded-card hover:border-line-strong flex items-center justify-between gap-6 border p-8 transition-colors"
            >
              <span>
                <span className="text-label font-latin text-magenta block uppercase">
                  {next.category}
                </span>
                <span className="text-h3 text-fg mt-1 block">{next.business_name}</span>
              </span>
              <Icon
                name="arrow"
                className="text-violet group-hover:text-magenta h-7 w-7 transition-[color,translate] duration-200 ease-snap group-hover:-translate-x-1 motion-reduce:transform-none"
              />
            </Link>
          </Container>
        </section>
      ) : null}

      <FinalCta />
    </>
  );
}
