'use client';

import { useEffect, useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react';
import type * as Engine from './engine';

/** useLayoutEffect warns during SSR; effects never run there anyway. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type AnimationEngine = typeof Engine;
export type BuildFn<T extends HTMLElement> = (
  engine: AnimationEngine,
  mm: Engine.MatchMedia,
  root: T,
) => void;

/**
 * Runs a GSAP setup function scoped to an element, and tears it down completely.
 *
 * Two things it guarantees:
 *
 *   1. The engine — GSAP, ScrollTrigger, SplitText, ~40 kB — is imported
 *      dynamically, so it never lands in the initial bundle.
 *   2. Everything the build function creates is registered inside a
 *      gsap.matchMedia() scoped to `root`, and mm.revert() on unmount kills
 *      every tween, ScrollTrigger and SplitText it made. No leaks across route
 *      changes (§4).
 *
 * Content is never hidden by CSS waiting for this to run: if the import fails,
 * the page is simply the static page.
 */
export function useGsapEffect<T extends HTMLElement = HTMLDivElement>(
  build: BuildFn<T>,
  deps: DependencyList = [],
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    let mm: Engine.MatchMedia | undefined;
    let cancelled = false;

    void import('./engine').then((engine) => {
      // Unmounted while the chunk was in flight.
      if (cancelled || !ref.current) return;
      mm = engine.gsap.matchMedia(ref.current);
      buildRef.current(engine, mm, ref.current);
    });

    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, deps);

  return ref;
}
