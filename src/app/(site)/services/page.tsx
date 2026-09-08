import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { FinalCta } from '@/components/sections/FinalCta';
import { ServiceArtwork } from '@/components/sections/ServiceArtwork';
import { Reveal } from '@/components/motion/Reveal';
import { Container } from '@/components/ui/Container';
import { getServices } from '@/lib/queries';
import s from '@/components/sections/editorial.module.css';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'שירותים',
  description: 'בניית אתרים, מיתוג ועיצוב, שיווק דיגיטלי, קידום אורגני ואוטומציות — חמישה שירותים תחת ספק אחד.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await getServices();
  return <>
    <PageHero eyebrow="Services / One connected system" title="כל החלקים. מערכת אחת."
      lead="מהזהות של המותג ועד הלקוח הבא. בוחרים את מה שהעסק צריך עכשיו, ובונים בסיס שאפשר לצמוח איתו."
      crumbs={[{ href: '/services', label: 'שירותים' }]}
      visual={<Image src="/brand/digital-system.webp" width={600} height={600} sizes="(max-width:900px) 90vw, 40vw" priority alt="אתרים, שיווק ואוטומציות במערכת מחוברת" />}
    />
    <section className="pb-20" aria-label="השירותים שלנו">
      <Container>
        <Reveal as="ul" className={s.services}>
          {services.map((service, i) => <li className={s.service} key={service.slug}>
            <span className={s.number} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h2><Link href={`/services/${service.slug}`}>{service.title}</Link></h2>
              <p>{service.short_desc}</p>
              {service.benefits.length > 0 && <ul className={s.tags}>{service.benefits.slice(0, 3).map(benefit => <li key={benefit}>{benefit}</li>)}</ul>}
              <Link href={`/services/${service.slug}`} className={s.link}>מגלים מה אפשר לבנות <span aria-hidden>←</span></Link>
            </div>
            <ServiceArtwork slug={service.slug} />
          </li>)}
        </Reveal>
      </Container>
    </section>
    <FinalCta />
  </>;
}
