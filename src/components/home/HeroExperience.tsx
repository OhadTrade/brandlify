'use client';

import type { ReactNode } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

export function HeroExperience({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useGsapEffect<HTMLElement>((engine, mm, root) => {
    const { gsap } = engine;
    mm.add(engine.MQ_DESKTOP, () => {
      const depth = root.querySelector('[data-hero-depth]');
      if (!depth) return;
      gsap.to(depth, {
        yPercent: 12, rotate: 2, scale: 0.97, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    });

    mm.add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const art = root.querySelector<HTMLElement>('[data-hero-tilt]');
      if (!art) return;
      const rotateX = gsap.quickTo(art, 'rotationX', { duration: 0.45, ease: 'power3.out' });
      const rotateY = gsap.quickTo(art, 'rotationY', { duration: 0.45, ease: 'power3.out' });
      const x = gsap.quickTo(art, 'x', { duration: 0.45, ease: 'power3.out' });
      let bounds = root.getBoundingClientRect();
      let measuredScrollY = window.scrollY;
      const measure = () => { bounds = root.getBoundingClientRect(); measuredScrollY = window.scrollY; };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        const horizontal = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const vertical = Math.max(-1, Math.min(1, (event.clientY - bounds.top + window.scrollY - measuredScrollY) / bounds.height * 2 - 1));
        rotateX(-vertical * 4);
        rotateY(horizontal * 7);
        x(horizontal * 10);
      };
      const reset = () => { rotateX(0); rotateY(0); x(0); };
      root.addEventListener('pointerenter', measure);
      root.addEventListener('pointermove', move);
      root.addEventListener('pointerleave', reset);
      window.addEventListener('resize', measure);
      return () => {
        root.removeEventListener('pointerenter', measure);
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerleave', reset);
        window.removeEventListener('resize', measure);
      };
    });
  }, []);

  return <section ref={ref} className={className} aria-labelledby="home-title">{children}</section>;
}
