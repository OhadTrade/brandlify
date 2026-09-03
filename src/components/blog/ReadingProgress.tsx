'use client';

import { useEffect, useRef } from 'react';
import { MQ } from '@/lib/animations/constants';

/**
 * Reading progress rail under the navbar.
 *
 * Plain scroll maths on a transform — no animation engine needed, and it stays
 * accurate under Lenis because Lenis scrolls the window itself. Under reduced
 * motion the bar still tracks position (it reports where you are, it is not
 * decoration) but the transition is dropped.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const el = bar.current;
    if (!target || !el) return;

    if (window.matchMedia(MQ.reduced).matches) el.style.transition = 'none';

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      el.style.transform = `scaleX(${done})`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div
      className="fixed inset-x-0 top-(--nav-height) z-40 h-0.5 bg-[rgb(250_250_252/0.06)]"
      role="progressbar"
      aria-label="התקדמות קריאה"
    >
      <div
        ref={bar}
        /*
          No transition. The scale is rewritten every scroll frame from rAF, so
          a transition on top of it is a second animation chasing the first —
          the bar ends up permanently 75ms behind the wheel and reads as lag
          rather than as smoothing. Scroll-linked motion is timed by the scroll.
        */
        className="bg-brand h-full w-full origin-right scale-x-0 will-change-transform"
      />
    </div>
  );
}
