'use client';

import type { ReactNode } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/** Home-only choreography; the shared engine and route animations stay intact. */
export function HomeFlow({ children }: { children: ReactNode }) {
  const ref = useGsapEffect<HTMLDivElement>((engine, mm, root) => {
    const { gsap, ScrollTrigger } = engine;

    mm.add(engine.MQ_DESKTOP, () => {
      const story = root.querySelector<HTMLElement>('[data-system-story]');
      const artwork = root.querySelector<HTMLElement>('[data-story-art]');
      const progress = root.querySelector<HTMLElement>('[data-story-progress]');
      if (story && artwork && progress) {
        gsap.fromTo(artwork, { y: 24, rotate: -4, scale: 0.96 }, {
          y: -24, rotate: 4, scale: 1.04, ease: 'none',
          scrollTrigger: { trigger: story, start: 'top 65%', end: 'bottom 80%', scrub: 0.6, invalidateOnRefresh: true },
        });
        gsap.fromTo(progress, { scaleX: 0 }, {
          scaleX: 1, ease: 'none',
          scrollTrigger: { trigger: story, start: 'top center', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
        });
      }
      root.querySelectorAll<HTMLElement>('[data-project-art]').forEach((art) => {
        gsap.fromTo(art, { yPercent: 5, scale: 1.06 }, {
          yPercent: -5, scale: 1, ease: 'none',
          scrollTrigger: { trigger: art.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      });
      // Never transform ancestors of the pinned stages or sticky process rail.
      const sections = root.querySelectorAll<HTMLElement>('[data-flow="lift"]');
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= window.innerHeight) continue;
        gsap.fromTo(section, { y: 24 }, {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 78%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    mm.add(engine.MQ_MOTION_OK, () => {
      const items = Array.from(root.querySelectorAll<HTMLElement>('[data-home-service]'))
        .filter((item) => item.getBoundingClientRect().top > window.innerHeight);
      if (items.length === 0) return;

      // Translation only: service links remain visible and operable at all times.
      gsap.set(items, { y: 16 });
      const reveal = (batch: Element[]) => gsap.to(batch, {
        y: 0,
        duration: 0.56,
        stagger: 0.06,
        ease: 'power3.out',
        overwrite: true,
      });
      ScrollTrigger.batch(items, {
        start: 'top 96%',
        once: true,
        onEnter: reveal,
        onEnterBack: reveal,
      });

      const onFocus = (event: FocusEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const item = target.closest<HTMLElement>('[data-home-service]');
        if (item && root.contains(item)) {
          gsap.killTweensOf(item);
          gsap.set(item, { y: 0 });
        }
      };
      root.addEventListener('focusin', onFocus);
      return () => root.removeEventListener('focusin', onFocus);
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}
