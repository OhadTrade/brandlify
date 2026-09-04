import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getPublishedProjects } from '@/lib/queries';

/**
 * Portfolio.
 *
 * Nothing published -> the section does not render at all. An empty grid, a
 * "coming soon" card or a placeholder tile would all be worse than silence:
 * they draw attention to the gap. Below three projects the spec calls for a
 * single expanded case study rather than a thin grid.
 */
export async function Portfolio() {
  const projects = await getPublishedProjects();
  if (projects.length === 0) return null;

  const featured = projects.length < 3;

  return (
    <section
      data-flow="lift" className="section-y bg-surface border-line border-y" aria-labelledby="work-heading">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Selected work"
          id="work-heading"
          title="עבודות שיצאו לאוויר."
          subtitle="כל פרויקט כאן הוא עסק אמיתי עם אתר חי. לחיצה תיקח אותך לסיפור המלא."
        />

        <ul
          className={
            featured
              ? 'grid gap-6'
              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {projects.map((project) => (
            <li key={project.id} className="group">
              <Link
                href={`/portfolio/${project.slug}`}
                className="border-line bg-elevated rounded-card hover:border-line-strong hover:shadow-lift block h-full overflow-hidden border transition-[translate,scale,border-color,box-shadow] duration-200 ease-snap active:scale-[0.99] active:duration-75 motion-reduce:active:scale-100 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div
                  className={`bg-base relative overflow-hidden ${featured ? 'aspect-[16/7]' : 'aspect-[4/3]'}`}
                >
                  {project.cover_image ? (
                    <Image
                      src={project.cover_image}
                      alt={`${project.business_name}: ${project.category}`}
                      fill
                      sizes={featured ? '(min-width: 1280px) 1232px, 100vw' : '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw'}
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
                  <p className="text-label font-latin text-magenta uppercase">{project.category}</p>
                  <h3 className="text-h3 text-fg">{project.business_name}</h3>
                  {project.description ? (
                    <p className="text-muted text-[0.9375rem] leading-relaxed">
                      {project.description}
                    </p>
                  ) : null}
                  {project.services.length > 0 ? (
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {project.services.map((service) => (
                        <li
                          key={service}
                          className="text-pink rounded-full bg-[rgb(230_53_240/0.12)] px-3 py-1 text-xs font-semibold"
                        >
                          {service}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div>
          <Button href="/portfolio" variant="secondary" size="lg">
            לכל העבודות
            <Icon name="arrow" className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
