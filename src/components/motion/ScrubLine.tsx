'use client';

import { useId, useRef } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/**
 * A gradient rule that draws itself as the section scrolls past.
 *
 * Horizontal draws right-to-left, vertical draws top-to-bottom, so in both
 * cases the line fills in the reading direction. Under reduced motion the
 * engine never runs and the SVG renders complete: a finished rule rather than
 * an empty gap.
 *
 * The gradient id is generated per instance. Two of these on one page sharing a
 * literal id would both resolve to whichever <defs> the browser saw first.
 */
export function ScrubLine({
  className,
  orientation = 'horizontal',
}: {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  const path = useRef<SVGLineElement>(null);
  // useId() returns delimiter characters (":r1:" on React 18, "«r1»" on 19)
  // that are not safe inside url(#...), so strip everything but word chars.
  const gradientId = `scrub-line-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const vertical = orientation === 'vertical';

  const root = useGsapEffect<HTMLDivElement>((engine, mm, el) => {
    if (!path.current) return;
    engine.scrubDraw(mm, path.current, {
      trigger: el,
      // A vertical rail is as tall as the section it spines, so it has to keep
      // drawing for the whole of it. The horizontal rule is a single band and
      // finishes well before the section leaves.
      start: vertical ? 'top 70%' : 'top 85%',
      end: vertical ? 'bottom 80%' : 'bottom 65%',
    });
  }, [vertical]);

  return (
    <div ref={root} className={className} aria-hidden>
      <svg
        width={vertical ? 2 : '100%'}
        height={vertical ? '100%' : 2}
        viewBox={vertical ? '0 0 2 100' : '0 0 100 2'}
        preserveAspectRatio="none"
        className="block"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1={vertical ? '0' : '100%'}
            y1={vertical ? '0' : '0'}
            x2={vertical ? '0' : '0'}
            y2={vertical ? '100%' : '0'}
          >
            <stop offset="0%" stopColor="#832FF0" />
            <stop offset="100%" stopColor="#E635F0" />
          </linearGradient>
        </defs>
        <line
          ref={path}
          x1={vertical ? 1 : 100}
          y1={vertical ? 0 : 1}
          x2={vertical ? 1 : 0}
          y2={vertical ? 100 : 1}
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
