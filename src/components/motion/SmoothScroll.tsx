'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { MQ } from '@/lib/animations/constants';

/**
 * Smooth scrolling, and the one place where the scroll engine and ScrollTrigger
 * are wired together.
 *
 * The spec lists both Lenis and ScrollSmoother. Running both would be a bug —
 * they are two implementations of the same job and would fight over the scroll
 * position. Lenis is the one kept:
 *
 *   - ScrollSmoother needs a `#smooth-wrapper > #smooth-content` structure with
 *     a transformed wrapper. That breaks `position: fixed` descendants, which
 *     this site has in the navbar and the mobile menu overlay, and it does not
 *     survive App Router navigations without re-initialising.
 *   - Lenis leaves the DOM alone, keeps the native scrollbar, and is ~3 kB.
 *
 * ScrollTrigger is driven from Lenis's scroll event and GSAP's ticker so the
 * two never disagree about the scroll position — the usual cause of pinned
 * sections drifting.
 *
 * With reduced motion, Lenis never starts: the browser's own scrolling is
 * exactly what that visitor asked for.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('@/lib/animations/engine'),
      ]);
      if (cancelled) return;

      const lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Native touch scrolling. Smoothing it costs responsiveness on the
        // devices least able to afford it.
        syncTouch: false,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      // Lenis already runs off rAF; GSAP's lag smoothing would double-correct.
      gsap.ticker.lagSmoothing(0);

      destroy = () => {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  // Section heights change with the page; stale trigger positions are the most
  // common cause of animations firing at the wrong scroll offset after a
  // client-side navigation.
  useEffect(() => {
    let cancelled = false;
    void import('@/lib/animations/engine').then(({ ScrollTrigger }) => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
