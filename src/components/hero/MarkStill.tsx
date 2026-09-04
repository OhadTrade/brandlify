import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * The mark as a flat image, with its glow.
 *
 * This is the whole visual on the mobile tier. There is no canvas below
 * 1024px by the animation guardrails, and no scroll stage either, so nothing
 * about the WebGL path needs to exist here: no eligibility check, no
 * IntersectionObserver, no ScrollTrigger, no dynamic import. It replaced
 * HeroVisual in the hero for exactly that reason - HeroVisual still ran its
 * whole eligibility machine on desktop even inside a `lg:hidden` wrapper, and
 * would have mounted a second, invisible canvas alongside the stage's.
 *
 * Height-constrained rather than width-constrained. The band it sits in is
 * sized from the viewport height, so an image sized from the width overflowed
 * it on a short phone and landed back underneath the headline.
 */
export function MarkStill({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex h-full w-full items-center justify-center', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto h-[62%] w-[62%] rounded-full opacity-60 blur-[90px]"
        style={{
          background:
            'radial-gradient(circle, rgb(230 53 240 / 0.35), rgb(131 47 240 / 0.25) 50%, transparent 72%)',
        }}
      />

      <Image
        // Drawn from the same facet geometry as the 3D mark rather than
        // upscaled from the small render, so it is sharp on the devices that
        // never get WebGL - which is most of them.
        src="/brand/mark-hero.png"
        alt=""
        width={1200}
        height={1575}
        priority
        sizes="(min-width: 1024px) 1px, 72vw"
        className="relative h-full w-auto max-w-[68vw] object-contain"
      />
    </div>
  );
}
