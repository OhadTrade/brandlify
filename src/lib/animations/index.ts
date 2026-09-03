/**
 * Public surface of the animation system.
 *
 * Deliberately does NOT re-export ./engine: that module statically imports
 * GSAP, and re-exporting it here would pull ~40 kB into any bundle that touches
 * a constant. The engine is only ever reached through useGsapEffect's dynamic
 * import.
 */
export { MQ, DESKTOP_MIN_WIDTH, MAX_PARTICLES } from './constants';
export { useGsapEffect, type AnimationEngine, type BuildFn } from './useGsapEffect';
export { useMagnetic } from './useMagnetic';
