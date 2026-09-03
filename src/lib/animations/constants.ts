/**
 * Animation tiers. Every scroll-driven effect is registered once inside a
 * gsap.matchMedia() keyed on these queries — never with ad-hoc `if` checks
 * scattered through components.
 *
 * Tier rules (non-negotiable, see spec §4):
 *   desktop  — full experience: pinning, scrub, parallax, WebGL
 *   reduced  — nothing moves
 *   mobile   — fade + slide only. No pinning, no horizontal scroll, no Three.js.
 */
export const MQ = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  belowDesktop: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
  /** Hover-capable pointer — magnetic and spotlight effects need this. */
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

/** The single breakpoint that separates the two animation tiers. */
export const DESKTOP_MIN_WIDTH = 1024;

/** Cap on the hero particle field. */
export const MAX_PARTICLES = 400;
