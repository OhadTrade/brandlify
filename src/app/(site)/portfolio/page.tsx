import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EmptyState, PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { FinalCta } from '@/components/sections/FinalCta';
import { Container } from '@/components/ui/Container';
import { getPublishedProjects } from '@/lib/queries';
import s from '@/components/sections/editorial.module.css';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'תיק עבודות',
  description: 'פרויקטים שיצאו לאוויר — אתרים, מיתוג וקמפיינים לעסקים בישראל.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const projects = await getPublishedProjects();
  return <>
    <PageHero eyebrow="Selected work" title="מרעיון לנוכחות שאפשר לראות."
      lead="עסקים אמיתיים, אתרים חיים והחשיבה שמחברת ביניהם. מבט מקרוב על העבודות שלנו."
      crumbs={[{ href: '/portfolio', label: 'עבודות' }]} />
    <section className="section-y" aria-label="הפרויקטים שלנו"><Container>
      {projects.length === 0 ? <EmptyState title="הפרויקטים הראשונים בדרך" body="אנחנו מעלים לכאן עבודות חיות ובאישור הלקוח. נשמח לספר לכם בשיחה מה בנינו ואיך." /> :
        <Reveal as="ul" className={s.portfolio}>
          {projects.map((project, i) => <li className={s.project} key={project.id}>
            <Link href={`/portfolio/${project.slug}`} className={s.projectImage} aria-label={`לפרויקט ${project.business_name}`}>
              {project.cover_image && <Image src={project.cover_image} alt={project.business_name} fill sizes="(max-width:900px) 95vw, 60vw" priority={i === 0} />}
            </Link>
            <div className={s.projectCopy}>
              <p className={s.label}>{String(i + 1).padStart(2, '0')} / {project.category}</p>
              <h2><Link href={`/portfolio/${project.slug}`}>{project.business_name}</Link></h2>
              {project.description && <p>{project.description}</p>}
              {project.services.length > 0 && <ul className={s.tags}>{project.services.map(service => <li key={service}>{service}</li>)}</ul>}
              <Link href={`/portfolio/${project.slug}`} className={s.link}>הסיפור מאחורי הפרויקט <span aria-hidden>←</span></Link>
            </div>
          </li>)}
        </Reveal>}
    </Container></section>
    <FinalCta />
  </>;
}
