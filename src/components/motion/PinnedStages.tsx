'use client';

import { Children, useRef, type ReactNode } from 'react';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';

/**
 * Pins the section and scrubs its track sideways — the BUILD/BRAND/GROW moment.
 *
 * Desktop only, enforced by the engine's MQ.desktop condition (§4: no pinning
 * and no horizontal scroll below 1024px). Below that the exact same markup is a
 * plain vertical stack, because the layout is CSS and only the movement is
 * JavaScript.
 *
 * The engine pins the whole <section>, not this wrapper. Pinning the wrapper
 * left the heading to scroll away while the cards stayed fixed at the top of the
 * viewport, overlapping the next section.
 */
export function PinnedStages({
  children,
  className,
  trackClassName,
  itemSelector = '[data-stage]',
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  itemSelector?: string;
}) {
  const track = useRef<HTMLOListElement>(null);
  const steps = useRef<HTMLSpanElement[]>([]);
  const stepCount = Children.count(children);

  const root = useGsapEffect<HTMLDivElement>((engine, mm, el) => {
    const trackEl = track.current;
    if (!trackEl) return;
    const items = Array.from(trackEl.querySelectorAll<HTMLElement>(itemSelector));
    if (items.length === 0) return;

    const last = Math.max(1, items.length - 1);

    engine.horizontalStages(mm, el, {
      track: trackEl,
      items,
      viewport: el,
      onProgress: (value) => {
        // Fill each segment as its stage is reached, so the rail reads as
        // "step 3 of 5" rather than as one continuous bar.
        steps.current.forEach((step, i) => {
          if (!step) return;
          const filled = Math.min(1, Math.max(0, (value - (i - 1) / last) * last));
          step.style.transform = `scaleX(${i === 0 ? 1 : filled})`;
        });
      },
    });
  }, []);

  return (
    <div ref={root} className={className}>
      {/*
        Soft edges. The track is wider than the container by design, so without
        this the cards entering and leaving are sliced off by the section's
        overflow — which reads as a layout fault rather than as a track that
        continues. Only applied where the track actually overflows.
      */}
      <div className="lg:[mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]">
        <ol ref={track} className={trackClassName}>
          {children}
        </ol>
      </div>

      {/* Stepped progress. One segment per stage, filling in turn. Hidden below
          the pin breakpoint, where the list simply scrolls and there is no
          progress to report. */}
      <div aria-hidden className="mx-auto mt-12 hidden max-w-md gap-2 lg:flex">
        {Array.from({ length: stepCount }, (_, i) => (
          <span
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-[rgb(250_250_252/0.10)]"
          >
            <span
              ref={(node) => {
                if (node) steps.current[i] = node;
              }}
              className="bg-brand block h-full w-full origin-right scale-x-0 will-change-transform"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
