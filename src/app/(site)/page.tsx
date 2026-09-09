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

const serviceArtwork: Record<string, string> = {
  websites: '/brand/services/websites-v1.webp',
  branding: '/brand/services/branding-v1.webp',
  marketing: '/brand/services/marketing-v1.webp',
  seo: '/brand/services/seo-v1.webp',
  automations: '/brand/services/automations-v1.webp',
};

const questions = [
  ['מאיפה מתחילים?', 'מהמטרה העסקית: מה אתם רוצים שהאתר יעזור להשיג, מי הקהל שלכם ומה כבר קיים היום. בשיחת ההיכרות נבחן את הצורך ונגדיר את הצעד הבא.'],
  ['צריך את כל השירותים כדי להתחיל?', 'לא בהכרח. אפשר להתחיל בצורך ממוקד, כמו אתר או אוטומציה, ולתכנן איך הוא יתחבר בהמשך לשיווק ולשאר המערכת.'],
  ['כבר יש לי אתר. מה כדאי לבדוק?', 'כדאי לבדוק אם ברור מה העסק מציע, אם נוח להשתמש באתר בנייד ואם הדרך לפנייה פשוטה. אלה נקודות פתיחה להחלטה מה לשפר ומה לשמור.'],
  ['איך מגדירים תקציב ולוח זמנים?', 'היקף העבודה תלוי בעמודים, בתוכן, בעיצוב ובחיבורים הנדרשים. בשיחה נברר את הצרכים והאילוצים כדי לבסס הצעה שמתאימה לפרויקט, בלי לנחש מחיר או מועד מראש.'],
] as const;

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
        <nav className={s.explore} aria-label="ניווט בתוך דף הבית">
          <a href="#services">השירותים שלנו <span aria-hidden>↓</span></a>
          {project && <a href="#selected-work">פרויקט נבחר <span aria-hidden>↓</span></a>}
          <a href="#process">איך עובדים <span aria-hidden>↓</span></a>
          <a href="#questions">לפני שמתחילים <span aria-hidden>↓</span></a>
        </nav>
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
                <Link href={`/services/${service.slug}`} data-service-card>
                  <span className={s.number}>0{i + 1}</span>
                  <h3>{service.title}</h3>
                  <p>{service.short_desc}</p>
                  <div className={s.serviceArt} aria-hidden>
                    <Image data-service-art src={serviceArtwork[service.slug] ?? '/brand/flowing-b.webp'} width={800} height={800} alt="" sizes="(max-width:480px) 88vw, (max-width:760px) 44vw, (max-width:1100px) 28vw, 18vw" />
                  </div>
                  <span>גלו עוד ←</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <SystemStory />
        {project && (
          <section id="selected-work" className={s.work} data-flow="lift" aria-labelledby="work-title">
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
        <section id="process" className={s.process} aria-labelledby="process-title">
          <div><p className={s.eyebrow}>FROM IDEA TO IMPACT</p><h2 id="process-title">תהליך<br />שמוביל<br />לתוצאות.</h2></div>
          <ol>{steps.map(([title, body], i) => (
            <li key={title} data-home-service><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></li>
          ))}</ol>
        </section>
        <section id="questions" className={s.questions} aria-labelledby="questions-title">
          <div>
            <p className={s.eyebrow}>A CLEAR NEXT STEP</p>
            <h2 id="questions-title">לפני שמתחילים.<br />עושים סדר.</h2>
            <p className={s.questionIntro}>לא צריך להגיע עם אפיון מוכן. מתחילים בשאלות הנכונות.</p>
            <Link className={s.questionContact} href="/contact">נדבר על הפרויקט שלכם <span aria-hidden>←</span></Link>
          </div>
          <div className={s.answers}>
            {questions.map(([question, answer], i) => (
              <details key={question}>
                <summary><span className={s.questionNumber} aria-hidden>0{i + 1}</span><span>{question}</span><span className={s.questionIcon} aria-hidden /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
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
