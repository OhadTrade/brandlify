'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';
import s from './story.module.css';

const chapters = [
  { id: 'build', label: 'BUILD', title: 'מתחילים בנוכחות. בונים אמון.', body: 'אתר שמספר את הסיפור שלכם, מסביר את הערך ומוביל את המבקר לצעד הבא. מהמסך הראשון ועד הפנייה.', link: '/services/websites', cta: 'בונים את הבסיס', tags: ['אסטרטגיה', 'עיצוב', 'פיתוח'] },
  { id: 'connect', label: 'CONNECT', title: 'מחברים את כל החלקים.', body: 'האתר, הקמפיינים והפניות מדברים באותה שפה. אוטומציות מקצרות את הדרך בין ליד חדש למענה אישי.', link: '/services/automations', cta: 'מחברים את המערכת', tags: ['אוטומציות', 'ניהול פניות', 'מעקב'] },
  { id: 'grow', label: 'GROW', title: 'מודדים. לומדים. מתקדמים.', body: 'מבינים מאיפה מגיעות הפניות, מה עובד ואיפה אפשר להשתפר. משפרים את החוויה ואת השיווק בהתאם לנתונים.', link: '/services/marketing', cta: 'מתקדמים לצמיחה', tags: ['שיווק', 'מדידה', 'אופטימיזציה'] },
] as const;

export function SystemStory() {
  const [active, setActive] = useState<number | null>(null);
  const ref = useGsapEffect<HTMLElement>((engine, mm, root) => {
    // Short viewports and reduced motion retain the complete vertical document.
    mm.add('(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)', () => {
      const frame = root.querySelector<HTMLElement>('[data-story-frame]')!;
      const viewport = root.querySelector<HTMLElement>('[data-story-viewport]')!;
      const track = root.querySelector<HTMLElement>('[data-story-track]')!;
      const rail = root.querySelector<HTMLElement>('[data-story-progress]')!;
      root.dataset.enhanced = 'true';
      let current = -1;
      const timeline = engine.gsap.timeline({
        scrollTrigger: {
          trigger: frame,
          start: () => 'top top+=' + document.querySelector('header')!.getBoundingClientRect().height,
          end: () => '+=' + window.innerHeight * (chapters.length - 1),
          pin: frame, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const index = Math.round(timeline.progress() * (chapters.length - 1));
          if (index !== current) { current = index; setActive(index); }
        },
      });
      timeline.to(track, {
        x: () => (document.dir === 'rtl' ? 1 : -1) * (track.scrollWidth - viewport.clientWidth),
        ease: 'none', duration: 1,
      }, 0);
      timeline.fromTo(rail, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
      setActive(0);

      const goTo = (index: number) => {
        const trigger = timeline.scrollTrigger!;
        const progress = index / (chapters.length - 1);
        window.scrollTo({ top: trigger.start + progress * (trigger.end - trigger.start), behavior: 'instant' });
        trigger.update();
        timeline.progress(progress);
        viewport.scrollLeft = 0;
      };
      const onClick = (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-story-jump]') : null;
        if (!target) return;
        event.preventDefault();
        // Preserve App Router history state, and only record deliberate jumps.
        if (location.hash !== target.hash) window.history.pushState(window.history.state, '', target.hash);
        goTo(Number(target.dataset.storyJump));
      };
      // Tab must reveal a focused link even when its scene is off screen.
      const onFocus = (event: FocusEvent) => {
        const scene = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-story-scene]') : null;
        if (scene) goTo(Number(scene.dataset.storyScene));
      };
      root.addEventListener('click', onClick);
      root.addEventListener('focusin', onFocus);
      let historyFrame = 0;
      const restoreChapter = () => {
        const index = chapters.findIndex(chapter => location.hash === `#system-${chapter.id}`);
        if (index !== -1) goTo(index);
      };
      const onHistoryChange = () => {
        cancelAnimationFrame(historyFrame);
        // Run after native hash scrolling / history scroll restoration.
        historyFrame = requestAnimationFrame(restoreChapter);
      };
      window.addEventListener('popstate', onHistoryChange);
      window.addEventListener('hashchange', onHistoryChange);
      const refreshFrame = requestAnimationFrame(() => {
        engine.ScrollTrigger.refresh();
        restoreChapter();
      });
      return () => {
        cancelAnimationFrame(refreshFrame);
        cancelAnimationFrame(historyFrame);
        window.removeEventListener('popstate', onHistoryChange);
        window.removeEventListener('hashchange', onHistoryChange);
        root.removeEventListener('click', onClick);
        root.removeEventListener('focusin', onFocus);
        delete root.dataset.enhanced;
        setActive(null);
      };
    });
  }, []);

  return (
    <section ref={ref} className={s.story} aria-labelledby="system-title">
      <div className={s.frame} data-story-frame>
        <div className={s.header}>
          <div><p className={s.label}>ONE CONNECTED SYSTEM</p><h2 id="system-title" className={s.heading}>כל חיבור פותח אפשרות.</h2></div>
          <nav aria-label="שלבי המערכת הדיגיטלית" className={s.navigation}>
            {chapters.map((chapter, index) => <a key={chapter.id} href={`#system-${chapter.id}`} data-story-jump={index} aria-current={active === index ? 'step' : undefined}><span aria-hidden>0{index + 1}</span> {chapter.label}</a>)}
          </nav>
        </div>
        <div className={s.viewport} data-story-viewport>
          <div className={s.track} data-story-track>
            {chapters.map((chapter, index) => (
              <article id={`system-${chapter.id}`} key={chapter.id} className={s.scene} data-story-scene={index}>
                <div className={s.copy}>
                  <p className={s.label}>0{index + 1} / {chapter.label}</p>
                  <h3>{chapter.title}</h3><p>{chapter.body}</p>
                  <ul className={s.tags}>{chapter.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
                  <Link href={chapter.link} className={s.link}>{chapter.cta} <span aria-hidden>←</span></Link>
                </div>
                <div className={s.visual} aria-hidden>
                  {chapter.id === 'connect' ? (
                    <Image src="/brand/digital-system.webp" alt="" width={1100} height={1100} sizes="(min-width:1024px) 45vw, 90vw" />
                  ) : chapter.id === 'build' ? (
                    <div className={s.browserArt}>
                      <div className={s.browserBar}><span>BRANDLIFY</span><i /><i /><i /></div>
                      <div className={s.browserBody}><strong>העסק שלך.<br />הסיפור שלך.</strong><Image src="/brand/flowing-b.webp" alt="" width={320} height={320} sizes="220px" /></div>
                      <div className={s.browserLines}><i /><i /><i /></div>
                    </div>
                  ) : (
                    <div className={s.growthArt}><div className={s.growthBars}><i /><i /><i /><i /></div><div className={s.orbit} /><p>ROOM TO GROW</p></div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className={s.rail} aria-hidden><span data-story-progress /></div>
      </div>
    </section>
  );
}
