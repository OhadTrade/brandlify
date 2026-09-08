import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getAuthoredContent, getContent, getServices } from '@/lib/queries';
import styles from '@/components/sections/studio-pages.module.css';

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
        eyebrow="The Brandlify approach"
        title="חשיבה אחת. כל החיבורים."
        lead="Brandlify מרכזת את כל מה שעסק צריך כדי להיראות ולהימצא ברשת — בנייה, מיתוג, שיווק, קידום ואוטומציות — תחת גג אחד ובעברית."
        crumbs={[{ href: '/about', label: 'אודות' }]}
        visual={<Image src="/brand/flowing-b.webp" alt="" width={600} height={600} priority sizes="(min-width: 901px) 40vw, 80vw" />}
      >
        <a href="#how-heading" className={styles.introLink}>כך אנחנו עובדים <Icon name="arrow" className="h-4 w-4" /></a>
      </PageHero>

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
        <Container className={styles.split}>
          <SectionHeading
            eyebrow="What we do"
            id="what-we-do-heading"
            title="לא אוסף שירותים. מערכת שעובדת יחד."
            subtitle="האתר, המותג, השיווק והאוטומציות מתוכננים סביב אותה מטרה עסקית. כל חיבור נבנה כחלק מהתמונה המלאה."
          />
          <Reveal as="ul" className={styles.serviceList} y={16} stagger={0.06}>
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} className={styles.serviceLink}>
                  <div><h3>{service.title}</h3><p>{service.short_desc}</p></div>
                  <Icon name="arrow" className="h-5 w-5" />
                </Link>
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
          <Reveal as="ol" className={styles.process} y={16} stagger={0.06}>
            {process.steps.map((step, i) => (
              <li key={step.title}>
                <span aria-hidden className={styles.processNumber}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </Reveal>
        </Container>
      </section>

      <section
        className="section-y bg-surface border-line border-y"
        aria-labelledby="commitments-heading"
      >
        <Container className={styles.split}>
          <SectionHeading
            eyebrow="Our commitments"
            id="commitments-heading"
            title={promises.title}
          />
          <Reveal as="ul" className={styles.commitments} y={16} stagger={0.06}>
            {promises.items.map((item) => (
              <li key={item.title}>
                <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </li>
            ))}
          </Reveal>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
