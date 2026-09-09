'use client';

import type { ReactNode } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/** Home-only choreography; the shared engine and route animations stay intact. */
export function HomeFlow({ children }: { children: ReactNode }) {
  const ref = useGsapEffect<HTMLDivElement>((engine, mm, root) => {
    const { gsap, ScrollTrigger } = engine;

    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const cleanups: Array<() => void> = [];
      root.querySelectorAll<HTMLElement>('[data-service-card]').forEach(card => {
        const art = card.querySelector<HTMLElement>('[data-service-art]');
        if (!art) return;
        const rotateX = gsap.quickTo(art, 'rotationX', { duration: 0.45, ease: 'power3.out' });
        const rotateY = gsap.quickTo(art, 'rotationY', { duration: 0.45, ease: 'power3.out' });
        const lift = gsap.quickTo(art, 'y', { duration: 0.45, ease: 'power3.out' });
        let bounds: DOMRect | undefined;
        let measuredScroll = 0;
        const measure = () => { bounds = card.getBoundingClientRect(); measuredScroll = window.scrollY; };
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          if (!bounds) measure();
          const box = bounds!;
          const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
          const y = Math.max(-1, Math.min(1, (event.clientY - box.top + window.scrollY - measuredScroll) / box.height * 2 - 1));
          rotateX(-y * 4); rotateY(x * 7); lift(-6);
        };
        const reset = () => { rotateX(0); rotateY(0); lift(0); bounds = undefined; };
        card.addEventListener('pointerenter', measure);
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', reset);
        card.addEventListener('pointercancel', reset);
        window.addEventListener('resize', reset);
        cleanups.push(() => {
          card.removeEventListener('pointerenter', measure);
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', reset);
          card.removeEventListener('pointercancel', reset);
          window.removeEventListener('resize', reset);
        });
      });
      return () => cleanups.forEach(cleanup => cleanup());
    });

    mm.add(engine.MQ_DESKTOP, () => {
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
