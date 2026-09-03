'use client';

import type { ReactNode } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/**
 * Fades and lifts the hero copy as the section scrolls away, so the mark behind
 * it is uncovered on the way out.
 *
 * The reference implementation did this with a raw `window.scroll` listener
 * writing inline styles. Here it is a scrubbed ScrollTrigger instead, for two
 * reasons: it stays in step with Lenis (a raw listener reads a scroll position
 * Lenis is still animating toward), and it inherits the tier rules — desktop
 * only, and nothing at all under reduced motion, where text quietly fading out
 * as you scroll is exactly what the visitor asked not to happen.
 */
export function HeroScrollFade({ children }: { children: ReactNode }) {
  const ref = useGsapEffect<HTMLDivElement>((engine, mm, root) => {
    mm.add(engine.MQ_DESKTOP, () => {
      engine.gsap.to(root, {
        opacity: 0,
        y: -60,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: root.closest('section') ?? root,
          start: 'top top',
          end: 'bottom 55%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  }, []);

  return (
    <div ref={ref} className="relative">
      {children}
    </div>
  );
}
