import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getAuthoredContent, getContent, getServices } from '@/lib/queries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'אודות',
  description:
    'מי אנחנו, איך אנחנו עובדים, ומה אנחנו מתחייבים אליו — סוכנות דיגיטל ישראלית שבונה אתרים שמייצרים פניות.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [story, promises, process, services] = await Promise.all([
    // No default and no stand-in: the founder's story is the owner's to write.
    // Until the row exists, the section simply does not render.
    getAuthoredContent('about.story'),
    getContent('home.promises'),
    getContent('home.process'),
    getServices(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="About"
        title="סוכנות אחת, במקום חמישה ספקים."
        lead="Brandlify מרכזת את כל מה שעסק צריך כדי להיראות ולהימצא ברשת — בנייה, מיתוג, שיווק, קידום ואוטומציות — תחת גג אחד ובעברית."
        crumbs={[{ href: '/about', label: 'אודות' }]}
      />

      {story ? (
        <section className="section-y" aria-labelledby="story-heading">
          <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <SectionHeading
              eyebrow="Our story"
              id="story-heading"
              title={story.title ?? 'הסיפור שלנו'}
            />
            <p className="text-muted text-[1.0625rem] leading-relaxed whitespace-pre-line">
              {story.body}
            </p>
          </Container>
        </section>
      ) : null}

      <section
        className="section-y bg-surface border-line border-y"
        aria-labelledby="what-we-do-heading"
      >
        <Container className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="What we do"
            id="what-we-do-heading"
            title="מה אנחנו עושים"
            subtitle="חמישה תחומים שמדברים אחד עם השני, במקום חמישה ספקים שמאשימים אחד את השני."
          />
          <Reveal as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li
                key={service.slug}
                className="border-line bg-elevated rounded-card flex items-start gap-4 border p-6"
              >
                <span
                  aria-hidden
                  className="border-line chamfer text-violet flex h-10 w-10 shrink-0 items-center justify-center border bg-[rgb(131_47_240/0.08)]"
                >
                  <Icon name={service.icon ?? 'globe'} className="h-5 w-5" />
                </span>
                <span>
                  <span className="text-fg block font-bold">{service.title}</span>
                  <span className="text-muted mt-1 block text-sm leading-relaxed">
                    {service.short_desc}
                  </span>
                </span>
              </li>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="section-y" aria-labelledby="how-heading">
        <Container className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="How we work"
            id="how-heading"
            title={process.title}
            subtitle={process.subtitle}
          />
          <Reveal as="ol" className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {process.steps.map((step, i) => (
              <li
                key={step.title}
                className="bg-surface relative overflow-hidden p-8 outline outline-[color:var(--color-line)]"
              >
                <span
                  aria-hidden
                  className="font-latin pointer-events-none absolute top-5 end-6 text-[3.5rem] leading-none font-extrabold text-[rgb(250_250_252/0.05)] select-none"
                  dir="ltr"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative flex flex-col gap-3">
                  <span aria-hidden className="bg-brand h-1 w-10 rounded-full" />
                  <h3 className="text-h3 text-fg">{step.title}</h3>
                  <p className="text-muted text-[0.9375rem] leading-relaxed">{step.description}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </Container>
      </section>

      <section
        className="section-y bg-surface border-line border-y"
        aria-labelledby="commitments-heading"
      >
        <Container className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="Our commitments"
            id="commitments-heading"
            title={promises.title}
          />
          <Reveal as="ul" className="grid gap-5 sm:grid-cols-2">
            {promises.items.map((item) => (
              <li
                key={item.title}
                className="border-line bg-elevated rounded-card flex gap-4 border p-7"
              >
                <span
                  aria-hidden
                  className="border-line chamfer text-magenta flex h-11 w-11 shrink-0 items-center justify-center border bg-[rgb(230_53_240/0.08)]"
                >
                  <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-fg text-lg font-extrabold">{item.title}</span>
                  <span className="text-muted text-[0.9375rem] leading-relaxed">
                    {item.description}
                  </span>
                </span>
              </li>
            ))}
          </Reveal>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
