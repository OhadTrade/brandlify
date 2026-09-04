'use client';

import type { ReactNode } from 'react';
import { asElement, type HtmlTag } from '@/lib/polymorphic';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

type ScrubGroupProps = {
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
  scale?: number;
  stagger?: number;
  /** Only for a group whose section has no `data-flow` of its own. */
  exit?: boolean;
  start?: string;
  end?: string;
};

/**
 * `Reveal`, but scrubbed.
 *
 * Same job and the same API: animate the children of a real layout element as
 * the group scrolls into view. The difference is that the stagger runs along
 * the scroll rather than on a fixed clock, so items land at the pace the reader
 * is moving and go back if they scroll up.
 *
 * `Reveal` is still the right thing for a group deep in the page that just
 * needs to not be there and then be there. This is for the two places where the
 * arrival is the point: the figures, which are the first thing under the hero,
 * and the service cards, which are the page's main offer.
 *
 * Registers nothing at all under reduced motion, so the page is simply the
 * static page.
 */
export function ScrubGroup({
  children,
  as: tag = 'div',
  className,
  selector = ':scope > *',
  y,
  scale,
  stagger,
  exit,
  start,
  end,
}: ScrubGroupProps) {
  const ref = useGsapEffect<HTMLElement>(
    (engine, mm, root) => {
      const targets = root.querySelectorAll(selector);
      if (targets.length === 0) return;
      engine.scrubItems(mm, root, targets, { y, scale, stagger, exit, start, end });
    },
    [selector, y, scale, stagger, exit, start, end],
  );
  const Tag = asElement(tag);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
