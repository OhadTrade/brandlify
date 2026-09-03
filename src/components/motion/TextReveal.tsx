'use client';

import { useState, type ReactNode } from 'react';
import { asElement, type HtmlTag } from '@/lib/polymorphic';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

type TextRevealProps = {
  children: ReactNode;
  as?: HtmlTag;
  className?: string;
  /** Per-glyph by default; words are the safer choice for mixed-direction copy. */
  by?: 'chars' | 'words';
  stagger?: number;
  duration?: number;
  delay?: number;
  /** Provide a ScrollTrigger start to defer the reveal; omit to play on mount. */
  start?: string;
  /**
   * Start hidden and let the reveal bring the text in. Only for above-the-fold
   * headings — see the safety net in globals.css. Off by default because
   * hiding content behind JavaScript is a decision, not a default.
   */
  hideUntilReady?: boolean;
};

/**
 * Masked line/character reveal, built on SplitText.
 *
 * SplitText's `aria: "auto"` labels the container and hides the fragments, so
 * assistive technology reads one uninterrupted sentence rather than a stream of
 * single letters.
 */
export function TextReveal({
  children,
  as: tag = 'h2',
  className,
  by = 'chars',
  stagger,
  duration,
  delay,
  start,
  hideUntilReady = false,
}: TextRevealProps) {
  const [ready, setReady] = useState(false);

  const ref = useGsapEffect<HTMLElement>(
    (engine, mm, root) => {
      engine.textReveal(mm, root, {
        by,
        stagger,
        duration,
        delay,
        start,
        onReady: () => setReady(true),
      });
    },
    [by, stagger, duration, delay, start],
  );
  const Tag = asElement(tag);

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={hideUntilReady && !ready ? 'pending' : undefined}
    >
      {children}
    </Tag>
  );
}
