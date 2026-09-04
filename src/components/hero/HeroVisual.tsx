'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { DESKTOP_MIN_WIDTH, MQ } from '@/lib/animations/constants';
import { cn } from '@/lib/utils';

/**
 * Decides whether the hero shows the WebGL B or the static mark, and never
 * downloads Three.js unless it is actually going to be used.
 *
 * Four conditions must all hold (§4, §6.2):
 *   - viewport >= 1024px            no WebGL on the mobile tier
 *   - motion is allowed             prefers-reduced-motion turns it off entirely
 *   - WebGL context available       older machines and locked-down browsers
 *   - the hero is on screen         nothing loads for a visitor who never sees it
 *
 * The static mark is server-rendered and is what the page paints first, so it
 * is a real fallback rather than a spinner — if any condition fails, or the
 * chunk never arrives, the hero is simply the image with its CSS glow.
 */

const HeroMark3D = dynamic(() => import('./HeroMark3D'), {
  ssr: false,
  loading: () => null,
});

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

export function HeroVisual({
  /**
   * 'backdrop' fills the whole hero and sits behind the copy; 'inline' keeps
   * the mark in its own column. Backdrop is what the home page uses.
   */
  variant = 'inline',
}: {
  variant?: 'inline' | 'backdrop';
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [eligible, setEligible] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [ready, setReady] = useState(false);

  // Tier check, re-evaluated when the viewport crosses the breakpoint.
  useEffect(() => {
    const desktop = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const reduced = window.matchMedia(MQ.reduced);

    const evaluate = () => setEligible(desktop.matches && !reduced.matches && hasWebGL());

    evaluate();
    desktop.addEventListener('change', evaluate);
    reduced.addEventListener('change', evaluate);
    return () => {
      desktop.removeEventListener('change', evaluate);
      reduced.removeEventListener('change', evaluate);
    };
  }, []);

  // Pause the render loop when the hero is not in view.
  useEffect(() => {
    const el = wrapper.current;
    if (!el || !eligible) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(Boolean(entry?.isIntersecting)),
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eligible]);

  // Scroll progress for the recede-and-fade, driven by ScrollTrigger so it stays
  // in step with Lenis rather than reading a raw scroll position.
  useEffect(() => {
    if (!eligible) return;
    const section = wrapper.current?.closest('section');
    if (!section) return;

    let trigger: { kill: () => void } | undefined;
    let cancelled = false;

    void import('@/lib/animations/engine').then(({ ScrollTrigger }) => {
      if (cancelled) return;
      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    });

    return () => {
      cancelled = true;
      trigger?.kill();
    };
  }, [eligible]);

  // Give the canvas a beat to draw its first frame before hiding the image, so
  // there is never a gap between the two.
  useEffect(() => {
    if (!eligible) {
      setReady(false);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 240);
    return () => window.clearTimeout(id);
  }, [eligible]);

  const backdrop = variant === 'backdrop';

  return (
    <div
      ref={wrapper}
      className={cn(
        'relative flex items-center',
        // Logical alignment, not a transform: the end side resolves to the left in
        // Hebrew and would flip on its own if the site were ever rendered LTR,
        // which keeps the mark on the opposite side from the copy either way.
        //
        // Below the breakpoint it used to run at 40% because the copy sat on
        // top of it. It no longer does: the hero gives the mark the top half of
        // the screen to itself there, so it can be shown at full strength and
        // actually be a logo rather than a texture.
        backdrop
          ? 'h-full w-full justify-center opacity-95 lg:justify-end lg:pe-[6%] lg:opacity-100'
          : 'w-full justify-center',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 m-auto rounded-full blur-[90px]',
          backdrop ? 'h-[62%] w-[62%] opacity-60' : 'h-[80%] w-[80%] opacity-70',
        )}
        style={{
          background:
            'radial-gradient(circle, rgb(230 53 240 / 0.35), rgb(131 47 240 / 0.25) 50%, transparent 72%)',
        }}
      />

      <Image
        // Drawn from the same facet geometry as the 3D mark rather than
        // upscaled from the 318px render, so it is sharp on the devices that
        // never get WebGL — which is most of them.
        src="/brand/mark-hero.png"
        alt=""
        width={1200}
        height={1575}
        priority
        sizes={backdrop ? '(min-width: 1024px) 620px, 72vw' : '(min-width: 1024px) 420px, 60vw'}
        className={cn(
          'relative max-w-full transition-opacity duration-500',
          backdrop
            ? // Height-constrained on mobile, width-constrained on desktop.
              // Sizing this by viewport width alone was wrong: the band it has
              // to fit into is half the viewport HEIGHT, so on a short phone
              // (375x667) a mark sized from the width overflowed the band and
              // landed back underneath the headline, which is the exact problem
              // the split was meant to solve.
              'h-full w-auto max-w-[68vw] object-contain lg:h-auto lg:w-[min(37vw,500px)] lg:max-w-full'
            : 'w-[220px] sm:w-[280px] lg:w-[380px]',
        )}
        style={{ opacity: ready ? 0 : 1 }}
      />

      {eligible ? (
        // The canvas fills its box and draws the mark in the middle of it, so
        // narrowing the box on the end side is what actually moves the 3D B
        // away from the copy. Full width below the breakpoint, where the copy
        // sits over it and the vignette does the separating.
        <div className="absolute inset-y-0 end-0 w-full lg:w-[64%]" aria-hidden>
          <HeroMark3D progress={progress} active={onScreen} />
        </div>
      ) : null}
    </div>
  );
}
