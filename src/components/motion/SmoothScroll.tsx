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
    let destroy: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('@/lib/animations/engine'),
      ]);
      if (cancelled) return;

      const media = gsap.matchMedia();
      destroy = () => media.revert();
      // Rebuild or stop immediately when the OS motion preference changes.
      media.add(MQ.motionOk, () => {
        const lenis = new Lenis({
          duration: 1.05,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          // Touch stays native for responsiveness on mobile.
          syncTouch: false,
        });

        lenis.on('scroll', ScrollTrigger.update);

        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        // Lenis already runs off rAF; GSAP's lag smoothing would double-correct.
        gsap.ticker.lagSmoothing(0);

        return () => {
          gsap.ticker.remove(raf);
          gsap.ticker.lagSmoothing(500, 33);
          lenis.destroy();
        };
      });
    })().catch(() => {
      destroy?.();
      // Native scrolling remains available if an optional motion chunk fails.
    });

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
    let refreshFrame = 0;
    let removeToggle: (() => void) | undefined;
    void import('@/lib/animations/engine').then(({ ScrollTrigger }) => {
      if (cancelled) return;
      const scheduleRefresh = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      };
      // Native details toggles do not bubble. Capture after layout changes and
      // coalesce rapid toggles without observing the pin spacers themselves.
      const onToggle = (event: Event) => {
        if (event.target instanceof HTMLDetailsElement && event.target.closest('main')) scheduleRefresh();
      };
      document.addEventListener('toggle', onToggle, true);
      removeToggle = () => document.removeEventListener('toggle', onToggle, true);
      scheduleRefresh();
    }).catch(() => {
      // Content and native disclosures do not depend on the motion engine.
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(refreshFrame);
      removeToggle?.();
    };
  }, [pathname]);

  return null;
}
