'use client';

import Image from 'next/image';
import { getServiceArtwork } from '@/lib/service-artwork';
import { useGsapEffect } from '@/lib/animations/useGsapEffect';
import s from './editorial.module.css';

export function ServiceArtwork({ slug, priority = false }: { slug: string; priority?: boolean }) {
  const ref = useGsapEffect<HTMLDivElement>(({ gsap }, mm, root) => {
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const image = root.querySelector('img');
      if (!image) return;
      const rotateX = gsap.quickTo(image, 'rotationX', { duration: 0.45, ease: 'power3.out' });
      const rotateY = gsap.quickTo(image, 'rotationY', { duration: 0.45, ease: 'power3.out' });
      const lift = gsap.quickTo(image, 'y', { duration: 0.45, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        const bounds = root.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        rotateX(-y * 4); rotateY(x * 7); lift(-6);
      };
      const reset = () => { rotateX(0); rotateY(0); lift(0); };
      root.addEventListener('pointermove', move, { passive: true });
      root.addEventListener('pointerleave', reset);
      root.addEventListener('pointercancel', reset);
      return () => {
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerleave', reset);
        root.removeEventListener('pointercancel', reset);
      };
    });
  }, [slug]);

  return <div ref={ref} className={s.art} data-kind={slug} aria-hidden="true">
    <Image data-service-art src={getServiceArtwork(slug)} width={800} height={800} alt="" priority={priority}
      sizes="(max-width:900px) 290px, 36vw" />
  </div>;
}
