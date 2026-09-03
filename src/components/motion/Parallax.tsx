'use client';

import type { ReactNode } from 'react';
import { asElement, type HtmlTag } from '@/lib/polymorphic';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/**
 * Scroll-linked drift. Desktop only, by tier rule (§4): no scrub below 1024px
 * and none at all under reduced motion.
 *
 * Moves with yPercent — a composited transform. Never top/margin.
 */
export function Parallax({
  children,
  as: tag = 'div',
  className,
  yPercent = 12,
}: {
  children: ReactNode;
  as?: HtmlTag;
  className?: string;
  /** Positive drifts down (lags the scroll), negative drifts up (leads it). */
  yPercent?: number;
}) {
  const ref = useGsapEffect<HTMLElement>(
    (engine, mm, root) => {
      engine.parallax(mm, root, { yPercent, trigger: root.parentElement });
    },
    [yPercent],
  );
  const Tag = asElement(tag);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
