'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DESKTOP_MIN_WIDTH, MQ } from '@/lib/animations/constants';

/**
 * The mark, held across several sections instead of dying with the hero.
 *
 * This is the one thing worth taking from the scroll experiences that get
 * called unique. Their trick is not the effect on any given element: it is that
 * there is a single subject, it never leaves, and scrolling re-frames it. The
 * page becomes a sequence of views of one object rather than a stack of
 * unrelated blocks that each animate themselves in.
 *
 * What is deliberately NOT taken from them: the architecture. Those sites are
 * WebGL applications at a URL - one canvas, no document, no scrollbar, and a
 * loading screen. igloo.inc serves a crawler 1,410 bytes and two words of text.
 * That is a defensible trade for a brand whose traffic comes from Discord. It
 * would delete this site, whose traffic is supposed to come from search. So the
 * document stays exactly as it was: real sections, real headings, real copy,
 * and the canvas sits behind them as a layer that happens to persist.
 *
 * Mechanically the stage is a tall wrapper with one `sticky` viewport-sized
 * layer inside it. The layer holds still while the sections scroll past, and a
 * single ScrollTrigger over the wrapper writes 0..1 into a ref that the scene
 * reads in its frame loop. One value, no React state, nothing re-renders.
 */

const HeroMark3D = dynamic(() => import('./HeroMark3D'), { ssr: false, loading: () => null });

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

export function MarkStage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [eligible, setEligible] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [ready, setReady] = useState(false);

  /*
   * Tier check, re-evaluated when the viewport crosses the breakpoint.
   * Four conditions, all of them from the animation guardrails: desktop only,
   * motion allowed, WebGL available, and (below) actually on screen.
   */
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

  // Stop the render loop entirely once the stage has left the viewport.
  useEffect(() => {
    const el = stage.current;
    if (!el || !eligible) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(Boolean(entry?.isIntersecting)),
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eligible]);

  /*
   * Scroll progress across the whole stage.
   *
   * `end: 'bottom bottom'` rather than 'bottom top': progress has to reach 1
   * at the moment the sticky layer stops sticking, which is when the wrapper's
   * bottom meets the viewport's bottom. Ending at 'bottom top' would leave the
   * mark mid-pose for a whole viewport of scrolling after it had visually
   * detached.
   *
   * Driven by ScrollTrigger and not by a scroll listener so it stays in step
   * with Lenis, which is animating toward a scroll position that a raw
   * listener would read too early.
   */
  useEffect(() => {
    if (!eligible || !stage.current) return;
    const el = stage.current;
    let trigger: { kill: () => void } | undefined;
    let cancelled = false;

    void import('@/lib/animations/engine').then(({ ScrollTrigger }) => {
      if (cancelled) return;
      trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
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

  // Give the canvas a beat to draw its first frame before hiding the still, so
  // there is never a gap between the two.
  useEffect(() => {
    if (!eligible) {
      setReady(false);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 240);
    return () => window.clearTimeout(id);
  }, [eligible]);

  return (
    <div ref={stage} className="relative">
      {/*
        The layer. Sticky rather than fixed: fixed would keep the mark on screen
        for the entire page, and it is supposed to hand over at the end of the
        stage. `-z-10` puts it behind every section's own content without
        needing a stacking context on each one.

        Desktop only. Below the breakpoint the hero renders its own still image
        in a band above the copy and this whole subtree is absent, so no device
        that cannot use the canvas pays for the markup around it.
      */}
      <div
        aria-hidden
        // Zero height, on purpose.
        //
        // A sticky element is still in normal flow and still occupies its own
        // height, so a `sticky h-svh` layer as the first child pushed every
        // section below it down by a whole viewport - the hero copy was still
        // on screen a thousand pixels into the page. Collapsing the sticky box
        // to nothing and letting its child overflow gives the same stick with
        // no space taken.
        className="pointer-events-none sticky top-0 -z-10 hidden h-0 w-full lg:block"
      >
        <div className="relative flex h-svh w-full items-center justify-center overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 m-auto h-[58%] w-[58%] rounded-full opacity-60 blur-[110px]"
            style={{
              background:
                'radial-gradient(circle, rgb(230 53 240 / 0.3), rgb(131 47 240 / 0.22) 50%, transparent 72%)',
            }}
          />

          <Image
            // The still the canvas fades in over. Drawn from the same facet
            // geometry as the 3D mark rather than upscaled from the small
            // render, so it is sharp on the machines that never get WebGL.
            src="/brand/mark-hero.png"
            alt=""
            width={1200}
            height={1575}
            priority
            sizes="(min-width: 1024px) 500px, 1px"
            className="relative w-[min(34vw,460px)] transition-opacity duration-500"
            style={{ opacity: ready ? 0 : 1 }}
          />

          {/* R3F's <Canvas> fills its parent, so it needs one with a size. As a
              flex child it would have collapsed to nothing. */}
          {eligible ? (
            <div className="absolute inset-0">
              <HeroMark3D progress={progress} active={onScreen} />
            </div>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}
