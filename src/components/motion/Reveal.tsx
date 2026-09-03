'use client';

import type { ReactNode } from 'react';
import { asElement, type HtmlTag } from '@/lib/polymorphic';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

type RevealProps = {
  children: ReactNode;
  /**
   * Render as the real layout element (`ul`, `ol`, `div`…) rather than adding a
   * wrapper — an extra div would break the grid and flex containers this is
   * usually applied to.
   */
  as?: HtmlTag;
  className?: string;
  /** What to animate, relative to this element. Defaults to direct children. */
  selector?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  start?: string;
};

/**
 * Staggered fade-and-rise for a group of elements as they scroll into view.
 *
 * Runs on both tiers — fade and slide are the only motion allowed below 1024px
 * (§4) — and does nothing at all under reduced motion. Elements already on
 * screen when the page loads are skipped, so nothing the visitor is looking at
 * gets hidden and re-shown.
 */
export function Reveal({
  children,
  as: tag = 'div',
  className,
  selector = ':scope > *',
  y,
  stagger,
  duration,
  start,
}: RevealProps) {
  const ref = useGsapEffect<HTMLElement>(
    (engine, mm, root) => {
      const targets = root.querySelectorAll(selector);
      if (targets.length === 0) return;
      engine.fadeUp(mm, targets, { y, stagger, duration, start });
    },
    [selector, y, stagger, duration, start],
  );
  const Tag = asElement(tag);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
