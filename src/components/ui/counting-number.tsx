'use client';

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type ValueAnimationTransition,
  // Imported from framer-motion, not "motion/react": they are the same library
  // under two names, and framer-motion is already a dependency here. Adding
  // `motion` as well would ship the whole animation runtime twice.
} from 'framer-motion';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { MQ } from '@/lib/animations/constants';
import { cn } from '@/lib/utils';

export type CountingNumberRef = {
  startAnimation: () => void;
};

export type CountingNumberProps = {
  from?: number;
  target: number;
  transition?: ValueAnimationTransition;
  className?: string;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
  /**
   * Wait until the number scrolls into view before counting. Off by default so
   * the component behaves as published; the stats bar sits below the fold and
   * turns it on, because a count that finishes before anyone sees it is just a
   * static number that arrived late.
   */
  startOnView?: boolean;
  /** How much of the element must be visible before counting begins. */
  viewAmount?: number;
};

export const CountingNumber = forwardRef<CountingNumberRef, CountingNumberProps>(
  (
    {
      from = 0,
      target = 100,
      transition = { duration: 2, ease: 'easeOut', type: 'tween' },
      className,
      onStart,
      onComplete,
      autoStart = true,
      startOnView = false,
      viewAmount = 0.4,
      ...props
    },
    ref,
  ) => {
    // Starts at the TARGET, not at the 'from' value.
    //
    // That is what the server renders and what stays on screen if the count
    // never runs — a throttled tab, a browser without IntersectionObserver, a
    // failed chunk. These are commitments the business makes; showing "0"
    // because an animation did not fire would be publishing a false figure.
    // startAnimation() drops the value to 'from' at the instant it actually
    // begins, so the count still starts from zero when it is really running.
    const count = useMotionValue(target);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('he-IL'));
    const controlsRef = useRef<AnimationPlaybackControls | null>(null);
    const spanRef = useRef<HTMLSpanElement>(null);

    // `transition` and the callbacks are object/function props, so a parent
    // re-render hands over new identities every time. Held in refs rather than
    // in the dependency list, they cannot retrigger the effect below — which
    // would tear the animation down and restart it from `from`, leaving the
    // number pinned at its starting value.
    const latest = useRef({ transition, onStart, onComplete });
    latest.current = { transition, onStart, onComplete };

    const startAnimation = useCallback(() => {
      controlsRef.current?.stop();
      const { transition: t, onStart: start, onComplete: complete } = latest.current;

      // A visitor who asked for reduced motion gets the figure, not the show.
      // The value still has to be right — this is information, not decoration.
      if (typeof window !== 'undefined' && window.matchMedia(MQ.reduced).matches) {
        count.set(target);
        complete?.();
        return;
      }

      start?.();
      count.set(from);
      controlsRef.current = animate(count, target, {
        ...t,
        onComplete: () => complete?.(),
      });
    }, [from, target, count]);

    useImperativeHandle(ref, () => ({ startAnimation }));

    useEffect(() => {
      if (!autoStart) return;

      if (!startOnView) {
        startAnimation();
        return () => controlsRef.current?.stop();
      }

      const el = spanRef.current;
      if (!el) return;

      // Already on screen at mount: start now rather than waiting for an
      // observer callback that may never be delivered.
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        startAnimation();
        return () => controlsRef.current?.stop();
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          // Once only: re-entering the viewport must not reset a finished count.
          observer.disconnect();
          startAnimation();
        },
        { threshold: viewAmount },
      );
      observer.observe(el);

      return () => {
        observer.disconnect();
        controlsRef.current?.stop();
      };
    }, [autoStart, startOnView, viewAmount, startAnimation]);

    return (
      <motion.span ref={spanRef} className={cn('tabular-nums', className)} {...props}>
        {rounded}
      </motion.span>
    );
  },
);

CountingNumber.displayName = 'CountingNumber';

export default CountingNumber;
