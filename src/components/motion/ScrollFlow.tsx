'use client';

import type { ReactNode } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/**
 * Gives every section marked `data-flow` an arrival and a departure.
 *
 * Opt-in by attribute rather than by wrapping each section: a wrapper div is a
 * new element in a layout these sections sit directly in, and the attribute
 * also carries which of the two treatments a section gets.
 *
 * `data-flow="lift"` fades and rises. `data-flow="fade"` only fades, and is for
 * the two sections that pin or stick — the horizontal stage track and the
 * process rail whose heading sticks — because a transformed ancestor becomes
 * the containing block for `position: sticky` and breaks ScrollTrigger's
 * pinning, while an ancestor that only changes opacity does neither. Giving
 * them nothing at all was the first version and it read as a bug: two blocks in
 * the middle of the page that alone did not move.
 *
 * One effect for the whole page rather than one per section: a single
 * matchMedia scope, and one revert on unmount that takes every timeline with
 * it. Under reduced motion `sectionFlow` registers nothing at all, so the page
 * is simply the static page.
 */
export function ScrollFlow({ children }: { children: ReactNode }) {
  const ref = useGsapEffect<HTMLDivElement>((engine, mm, root) => {
    engine.sectionFlow(mm, root.querySelectorAll('[data-flow="lift"]'));
    // The two that pin or stick fade only. See the `lift` option.
    engine.sectionFlow(mm, root.querySelectorAll('[data-flow="fade"]'), { lift: false });
  }, []);

  return <div ref={ref}>{children}</div>;
}
