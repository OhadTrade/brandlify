'use client';

import { useEffect, useRef } from 'react';
import { MQ } from './constants';

type Options = {
  /** Distance from the element's edge at which the pull begins. */
  radius?: number;
  /** How far the element travels toward the pointer, as a share of the offset. */
  strength?: number;
};

/**
 * Pulls an element toward the cursor while the cursor is nearby.
 *
 * Transform-only (GPU), rAF-throttled, and inert without a fine pointer or when
 * the visitor asks for reduced motion. Listens on the window rather than the
 * element so the pull starts before the cursor arrives.
 */
export function useMagnetic<T extends HTMLElement>({ radius = 80, strength = 0.35 }: Options = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia(MQ.finePointer).matches) return;
    if (window.matchMedia(MQ.reduced).matches) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      frame = 0;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      // Distance to the element's box, not its centre, so wide buttons feel even.
      const outsideX = Math.max(0, Math.abs(dx) - rect.width / 2);
      const outsideY = Math.max(0, Math.abs(dy) - rect.height / 2);
      const distance = Math.hypot(outsideX, outsideY);

      if (distance > radius) {
        if (tx === 0 && ty === 0) return;
        tx = 0;
        ty = 0;
      } else {
        const falloff = 1 - distance / radius;
        tx = dx * strength * falloff;
        ty = dy * strength * falloff;
      }
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const reset = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', reset);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('blur', reset);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = '';
    };
  }, [radius, strength]);

  return ref;
}
