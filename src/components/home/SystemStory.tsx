import Image from 'next/image';
import Link from 'next/link';
import s from './story.module.css';

const chapters = [
  { id: 'build', label: 'BUILD', title: 'מתחילים בנוכחות. בונים אמון.', body: 'אתר שמספר את הסיפור שלכם, מסביר את הערך ומוביל את המבקר לצעד הבא. מהמסך הראשון ועד הפנייה.', link: '/services/websites', cta: 'בונים את הבסיס' },
  { id: 'connect', label: 'CONNECT', title: 'מחברים את כל החלקים.', body: 'האתר, הקמפיינים והפניות מדברים באותה שפה. אוטומציות מקצרות את הדרך בין ליד חדש למענה אישי.', link: '/services/automations', cta: 'מחברים את המערכת' },
  { id: 'grow', label: 'GROW', title: 'מודדים. לומדים. מתקדמים.', body: 'מבינים מאיפה מגיעות הפניות, מה עובד ואיפה אפשר להשתפר. משפרים את החוויה ואת השיווק בהתאם לנתונים.', link: '/services/marketing', cta: 'מתקדמים לצמיחה' },
] as const;

export function SystemStory() {
  return (
    <section className={s.story} aria-label="איך המערכת הדיגיטלית מתחברת" data-system-story>
      <div className={s.visual}>
        <p className={s.label}>ONE CONNECTED SYSTEM</p>
        <div className={s.art} data-story-art>
          <Image src="/brand/digital-system.webp" alt="אתר, אוטומציות ושיווק מחוברים ברצועת זכוכית וכרום" width={1100} height={1100} sizes="(max-width:1023px) 90vw, 50vw" />
        </div>
        <div className={s.rail} aria-hidden="true"><span data-story-progress /></div>
        <p className={s.caption}>אסטרטגיה אחת. מערכת שלמה.</p>
      </div>
      <div className={s.chapters}>
        {chapters.map((chapter, i) => (
          <article key={chapter.id} className={s.chapter} data-story-chapter>
            <p className={s.label} dir="ltr">0{i + 1} / {chapter.label}</p>
            <h2>{chapter.title}</h2>
            <p>{chapter.body}</p>
            <Link href={chapter.link}>{chapter.cta} <span aria-hidden>←</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
