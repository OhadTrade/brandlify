'use client';

import { useRef } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/**
 * A gradient rule that draws itself as the section scrolls past.
 *
 * Right-to-left: the line is drawn from x=100% to x=0 so it fills in the
 * reading direction. Under reduced motion the engine never runs, and the SVG
 * renders complete — a finished rule rather than an empty gap.
 */
export function ScrubLine({ className }: { className?: string }) {
  const path = useRef<SVGLineElement>(null);

  const root = useGsapEffect<HTMLDivElement>((engine, mm, el) => {
    if (!path.current) return;
    engine.scrubDraw(mm, path.current, { trigger: el, start: 'top 85%', end: 'bottom 65%' });
  }, []);

  return (
    <div ref={root} className={className} aria-hidden>
      <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none" className="block">
        <defs>
          <linearGradient id="scrub-line-gradient" x1="100%" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#832FF0" />
            <stop offset="100%" stopColor="#E635F0" />
          </linearGradient>
        </defs>
        <line
          ref={path}
          x1="100"
          y1="1"
          x2="0"
          y2="1"
          stroke="url(#scrub-line-gradient)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
