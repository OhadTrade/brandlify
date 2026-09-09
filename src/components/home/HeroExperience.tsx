'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { MaterialReveal } from './materialReveal';

const DESKTOP = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function HeroExperience({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    const depth = root?.querySelector<HTMLElement>('[data-hero-depth]');
    const image = depth?.querySelector<HTMLImageElement>('img');
    if (!root || !depth || !image) return;
    const query = window.matchMedia(DESKTOP);
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    let cleanup: (() => void) | undefined;

    const configure = () => {
      cleanup?.();
      cleanup = undefined;
      if (!query.matches || device.connection?.saveData || (device.deviceMemory ?? 8) < 4 || (device.hardwareConcurrency || 8) < 4) return;
      let cancelled = false;
      let reveal: MaterialReveal | undefined;
      let context: { revert: () => void } | undefined;
      let visible = false;
      let failed = false;
      let gl: WebGL2RenderingContext | null = null;
      const bootAt = performance.now();
      const canvas = document.createElement('canvas');
      canvas.dataset.heroCanvas = '';
      canvas.setAttribute('aria-hidden', 'true');
      const fail = () => {
        failed = true;
        delete depth.dataset.materialReady;
        canvas.remove();
        reveal?.dispose();
        if (!reveal) gl?.getExtension('WEBGL_lose_context')?.loseContext();
        reveal = undefined;
        context?.revert();
        context = undefined;
      };
      const visibility = () => reveal?.setActive(visible && !document.hidden);
      const observer = new IntersectionObserver(([entry]) => {
        visible = !!entry?.isIntersecting;
        visibility();
        if (visible) void start();
      });
      let started = false;
      const start = async () => {
        if (started || cancelled) return;
        started = true;
        try {
          // Probe before downloading Three; unsupported devices keep the SSR image.
          gl = canvas.getContext('webgl2', { alpha: true, antialias: true, failIfMajorPerformanceCaveat: true, powerPreference: 'low-power' });
          if (!gl) return;
          const [material, engine] = await Promise.all([import('./materialReveal'), import('@/lib/animations/engine'), image.decode()]);
          const source = new window.Image();
          source.src = image.currentSrc || image.src;
          await source.decode();
          if (cancelled) { gl.getExtension('WEBGL_lose_context')?.loseContext(); return; }
          depth.append(canvas);
          // A late chunk must not hide a logo the visitor has already been reading.
          reveal = material.createMaterialReveal(canvas, gl, source, fail, performance.now() - bootAt > 1200);
          reveal.setActive(visible && !document.hidden);
          context = engine.gsap.context(() => {
            engine.gsap.to(depth, {
              x: () => {
                const brand = document.querySelector('[data-header-brand] img');
                const box = brand?.getBoundingClientRect();
                const own = depth.getBoundingClientRect();
                return box ? box.left + box.width / 2 - own.left - own.width / 2 : -60;
              },
              y: -100, scale: 0.28, rotation: -7, opacity: 0, ease: 'none',
              scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
            });
          }, root);
          if (failed) fail();
        } catch { if (!cancelled) fail(); }
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        const bounds = root.getBoundingClientRect();
        reveal?.point((event.clientX - bounds.left) / bounds.width * 2 - 1, (event.clientY - bounds.top) / bounds.height * 2 - 1);
      };
      const reset = () => reveal?.point(0, 0);
      root.addEventListener('pointermove', move, { passive: true });
      root.addEventListener('pointerleave', reset);
      root.addEventListener('pointercancel', reset);
      document.addEventListener('visibilitychange', visibility);
      observer.observe(root);
      cleanup = () => {
        cancelled = true;
        observer.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerleave', reset);
        root.removeEventListener('pointercancel', reset);
        fail();
      };
    };
    configure();
    query.addEventListener('change', configure);
    return () => { query.removeEventListener('change', configure); cleanup?.(); };
  }, []);

  return <section ref={ref} className={className} aria-labelledby="home-title">{children}</section>;
}
