import Image from 'next/image';
import Link from 'next/link';
import { HomeFlow } from '@/components/home/HomeFlow';
import { HeroExperience } from '@/components/home/HeroExperience';
import { SystemStory } from '@/components/home/SystemStory';
import { getServices, getPublishedProjects } from '@/lib/queries';
import { whatsappUrl } from '@/lib/site';
import s from '@/components/home/studio.module.css';

export const revalidate = 300;

const steps = [
  ['מבינים את העסק', 'מקשיבים, לומדים ומגדירים מטרות.'],
  ['מתכננים את המערכת', 'אסטרטגיה, אפיון ותוכנית פעולה ברורה.'],
  ['מעצבים ובונים', 'עיצוב, פיתוח וחיבור בין המערכות.'],
  ['עולים לאוויר ומשפרים', 'השקה, מדידה ואופטימיזציה לצמיחה.'],
];

function Actions() {
  return <div className={s.actions}>
    <Link href="/contact">קובעים שיחת היכרות ←</Link>
    <a href={whatsappUrl()}>דברו איתנו ב־WhatsApp</a>
  </div>;
}

export default async function Home() {
  const [services, projects] = await Promise.all([getServices(), getPublishedProjects()]);
  const project = projects[0];

  return (
    <div className={s.studio}>
      <HeroExperience className={s.hero}>
        <div>
          <p className={s.eyebrow}>DIGITAL BUSINESS. BEYOND POSSIBLE.</p>
          <h1 id="home-title">לא עוד אתר.<br /><span>מערכת דיגיטלית</span><br />שבונה את<br />העסק קדימה.</h1>
          <p className={s.intro}>אתרים, שיווק, אוטומציות ופתרונות דיגיטליים.<br />הכל מחובר לצמיחה שלך.</p>
          <Actions />
        </div>
        <div className={s.heroDepth} data-hero-depth>
          <div className={s.heroTilt} data-hero-tilt>
            <Image className={s.art} src="/brand/flowing-b.webp" width={1200} height={1200} priority sizes="(max-width:760px) 100vw, 52vw" alt="סימן Brandlify זורם מזכוכית וכרום בגווני קורל, ורוד וסגול" />
          </div>
        </div>
      </HeroExperience>
      <div className={s.industries}>
        <p>מערכות דיגיטליות לעסקים שרוצים להתקדם</p>
        <div dir="ltr">STARTUPS · ECOMMERCE · REAL ESTATE · CLINICS · AND MORE</div>
        <a href="#services">גללו לגלות ↓</a>
      </div>
      <HomeFlow>
        <section id="services" className={s.services} aria-labelledby="services-title">
          <p className={s.eyebrow}>ONE VISION. MANY POSSIBILITIES.</p>
          <div className={s.heading}>
            <h2 id="services-title">כל מה שהעסק שלך צריך.<br />במקום אחד.</h2>
            <p>אנחנו מחברים בין אסטרטגיה, עיצוב וטכנולוגיה כדי ליצור לעסק שלך מערכת דיגיטלית שלמה שמביאה תוצאות אמיתיות.</p>
          </div>
          <ul className={s.grid}>
            {services.map((service, i) => (
              <li key={service.slug} data-home-service>
                <Link href={`/services/${service.slug}`}>
                  <span className={s.number}>0{i + 1}</span>
                  <h3>{service.title}</h3>
                  <p>{service.short_desc}</p>
                  <div className={s.material} data-service-kind={service.slug} aria-hidden><i /><i /><b /></div>
                  <span>גלו עוד ←</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <SystemStory />
        {project && (
          <section className={s.work} data-flow="lift" aria-labelledby="work-title">
            <div>
              <p className={s.eyebrow}>SELECTED WORK</p>
              <h2 id="work-title">פרויקט נבחר.</h2>
              <h3>{project.business_name}</h3>
              <p>{project.description}</p>
              <Link href={`/portfolio/${project.slug}`}>לצפייה בפרויקט ←</Link>
            </div>
            <Link className={s.project} href={`/portfolio/${project.slug}`}>
              {project.cover_image && <Image src={project.cover_image} fill sizes="(max-width:760px) 100vw, 60vw" alt={project.business_name} className="object-cover" data-project-art />}
            </Link>
          </section>
        )}
        <section className={s.process} aria-labelledby="process-title">
          <div><p className={s.eyebrow}>FROM IDEA TO IMPACT</p><h2 id="process-title">תהליך<br />שמוביל<br />לתוצאות.</h2></div>
          <ol>{steps.map(([title, body], i) => (
            <li key={title} data-home-service><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></li>
          ))}</ol>
        </section>
        <section className={s.final} data-flow="lift" aria-labelledby="final-title">
          <Image src="/brand/flowing-b.webp" width={320} height={320} alt="" sizes="(max-width:760px) 160px, 300px" />
          <div>
            <p className={s.eyebrow}>SAME BUSINESS. A BRIGHTER FUTURE.</p>
            <h2 id="final-title">בואו נבנה משהו<br />שאנשים <span>יזכרו.</span></h2>
            <p>יש לכם עסק. יש לנו את הכלים לקחת אותו קדימה.</p>
            <Actions />
          </div>
        </section>
      </HomeFlow>
    </div>
  );
}
