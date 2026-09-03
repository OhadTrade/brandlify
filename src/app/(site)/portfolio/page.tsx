import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EmptyState, PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { getPublishedProjects } from '@/lib/queries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'תיק עבודות',
  description: 'פרויקטים שיצאו לאוויר — אתרים, מיתוג וקמפיינים לעסקים בישראל.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <PageHero
        eyebrow="Selected work"
        title="עבודות שיצאו לאוויר."
        lead="כל פרויקט כאן הוא עסק אמיתי עם אתר חי. אין כאן קונספטים ואין תרגילי עיצוב."
        crumbs={[{ href: '/portfolio', label: 'עבודות' }]}
      />

      <section className="section-y">
        <Container>
          {projects.length === 0 ? (
            /* Honest emptiness. No placeholder tiles, no invented case studies. */
            <EmptyState
              title="הפרויקטים הראשונים בדרך"
              body="אנחנו מעלים לכאן רק עבודות חיות ובאישור הלקוח. בינתיים — נשמח לספר לך בשיחה מה בנינו ואיך."
              ctaLabel="דברו איתנו"
            />
          ) : (
            <Reveal as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.id} className="group">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="border-line bg-surface rounded-card hover:border-line-strong hover:shadow-lift block h-full overflow-hidden border transition-[translate,scale,border-color,box-shadow] duration-200 ease-snap active:scale-[0.99] active:duration-75 motion-reduce:active:scale-100 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <div className="bg-base relative aspect-[4/3] overflow-hidden">
                      {project.cover_image ? (
                        <Image
                          src={project.cover_image}
                          alt={`${project.business_name} — ${project.category}`}
                          fill
                          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-400 ease-snap group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                        />
                      ) : null}
                      <span
                        aria-hidden
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            'linear-gradient(to top, rgb(8 6 14 / 0.92), rgb(131 47 240 / 0.25) 60%, transparent)',
                        }}
                      />
                      <span className="text-fg absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-2 p-5 text-sm font-semibold opacity-0 transition-[opacity,translate] duration-200 ease-snap group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transform-none motion-reduce:transition-none">
                        צפייה בפרויקט
                        <Icon name="arrow" className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 p-6">
                      <p className="text-label font-latin text-magenta uppercase">
                        {project.category}
                      </p>
                      <h2 className="text-h3 text-fg">{project.business_name}</h2>
                      {project.description ? (
                        <p className="text-muted text-[0.9375rem] leading-relaxed">
                          {project.description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </Reveal>
          )}
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
