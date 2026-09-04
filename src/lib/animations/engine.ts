import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MQ } from './constants';

/**
 * The animation engine.
 *
 * This module statically imports GSAP, so it must only ever be reached through
 * the dynamic import in useGsapEffect(). That keeps ~40 kB of animation code
 * out of the initial bundle: nothing here affects first paint, and the JS
 * budget (§4, 250 kB gzip) is spent on things that do.
 *
 * Every primitive registers inside a gsap.matchMedia() condition, so the tier
 * rules from §4 are enforced in one place instead of by `if`s in components:
 *
 *   MQ.desktop   >= 1024px AND no reduced-motion — pin, scrub, parallax, 3D
 *   MQ.motionOk  any width, no reduced-motion    — fade and slide only
 *   (reduced)    no condition matches            — nothing runs, nothing hides
 *
 * Reduced motion is handled by absence: a visitor who asks for it never enters
 * any condition, so no element is ever set to opacity 0 in the first place.
 * That is why nothing here relies on CSS to pre-hide content.
 */

gsap.registerPlugin(ScrollTrigger, SplitText);

gsap.defaults({ ease: 'power3.out', duration: 0.7 });
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Announce that the engine is live. globals.css keys a safety fade off the
 * absence of this flag, so a heading that is hidden waiting for a masked reveal
 * still appears if this chunk never arrives.
 */
if (typeof document !== 'undefined') {
  document.documentElement.dataset.motion = 'ready';
}

/**
 * Development-only handle, so ScrollTrigger leaks can be checked from the
 * console: `__gsapEngine.ScrollTrigger.getAll().length` should return to zero
 * after navigating away from an animated page. Stripped from production builds.
 */
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__gsapEngine = { gsap, ScrollTrigger, SplitText };
}

/** How late the engine may boot and still be allowed to play an entrance. */
const LATE_BOOT_MS = 1200;
const isLateBoot = () => performance.now() > LATE_BOOT_MS;

export { gsap, ScrollTrigger, SplitText };

/** Re-exported so callers can add their own conditions without importing MQ
 *  separately and accidentally bypassing a tier. */
export const MQ_DESKTOP = MQ.desktop;
export const MQ_MOTION_OK = MQ.motionOk;

export type MatchMedia = ReturnType<typeof gsap.matchMedia>;
type Targets = gsap.DOMTarget;

/** Mirror an X offset for the writing direction. Never write a raw X value. */
export function dirX(value: number): number {
  return document.dir === 'rtl' ? -value : value;
}

/**
 * Elements already on screen when the engine boots are left alone.
 *
 * The page is server-rendered and painted before hydration, so hiding something
 * the visitor is already looking at produces a visible flicker — and animating
 * it in "reveals" content they have seen for 300ms. Only what is still below
 * the fold gets an entrance.
 */
function belowTheFold(targets: Targets): HTMLElement[] {
  return gsap.utils
    .toArray<HTMLElement>(targets)
    .filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
}

// -----------------------------------------------------------------------------
// fadeUp — the workhorse entrance. Runs on both tiers.
// -----------------------------------------------------------------------------

export type FadeUpOptions = {
  y?: number;
  stagger?: number;
  duration?: number;
  start?: string;
};

export function fadeUp(
  mm: MatchMedia,
  targets: Targets,
  { y = 28, stagger = 0.08, duration = 0.7, start = 'top 88%' }: FadeUpOptions = {},
) {
  mm.add(MQ.motionOk, () => {
    const els = belowTheFold(targets);
    if (els.length === 0) return;

    // transform + opacity only: both composited, neither triggers layout.
    gsap.set(els, { opacity: 0, y, force3D: true });

    ScrollTrigger.batch(els, {
      start,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration, stagger, overwrite: true }),
    });
  });
}

// -----------------------------------------------------------------------------
// sectionFlow — a section arrives and leaves with the scroll
// -----------------------------------------------------------------------------

/**
 * Ties a section's opacity and offset to its own passage through the viewport.
 *
 * `fadeUp` above is a one-shot: a section crosses a line, plays once, and is
 * then inert for the rest of the page. That is why scrolling this site felt
 * like paging through slides - every block was either not-yet-arrived or
 * permanently arrived, and nothing was ever in motion because of where the
 * reader was. This is scrubbed instead, so the page is always responding.
 *
 * One timeline, not two tweens. An enter tween and an exit tween on the same
 * element are two ScrollTriggers writing the same opacity, and on a short
 * section their ranges overlap and they fight. A single timeline with a hold in
 * the middle cannot: proportions are of the section's whole passage, so the
 * hold stretches on a tall section and shrinks on a short one, automatically.
 *
 * The exit is deliberately partial. Fading a section to nothing as it leaves
 * makes scrolling back up feel broken, and it hides content someone may still
 * be reading at the top of their screen; dropping it to a third reads as
 * depth-of-field rather than as disappearance.
 *
 * Transform + opacity only, both composited. Never apply this to a section that
 * contains a pinned or sticky child: a transformed ancestor becomes the
 * containing block for both, and ScrollTrigger's pinning breaks inside one.
 */
export function sectionFlow(
  mm: MatchMedia,
  targets: Targets,
  /**
   * Set false for a section that pins or sticks. A transformed ancestor becomes
   * the containing block for `position: sticky` and breaks ScrollTrigger's
   * pinning; an ancestor that only changes opacity does neither, so those
   * sections still arrive and leave, just without the lift. Leaving them out
   * entirely was the first version and it read as a bug: two blocks in the
   * middle of the page that alone did not move.
   */
  { lift = true }: { lift?: boolean } = {},
) {
  mm.add(MQ.motionOk, () => {
    const els = gsap.utils.toArray<HTMLElement>(targets);
    if (els.length === 0) return;

    const from = lift ? { opacity: 0, y: 44, force3D: true } : { opacity: 0 };
    const held = lift ? { opacity: 1, y: 0 } : { opacity: 1 };
    const gone = lift ? { opacity: 0.32, y: -34 } : { opacity: 0.32 };

    for (const el of els) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          // A little smoothing, so a fast flick does not snap the whole
          // section from one end of its arc to the other in a single frame.
          scrub: 0.5,
        },
      });

      tl.fromTo(el, from, { ...held, ease: 'none', duration: 0.24 })
        // The hold. This is most of the passage and it is where the section is
        // simply readable; the motion exists at the edges, not underneath the
        // text someone is reading.
        .to(el, { ...held, duration: 0.5 })
        .to(el, { ...gone, ease: 'none', duration: 0.26 });
    }
  });
}

// -----------------------------------------------------------------------------
// scrubItems — a group arrives one by one, tied to the scroll
// -----------------------------------------------------------------------------

/**
 * Scrubbed, staggered arrival for the items inside a section.
 *
 * `fadeUp` plays a group in once, at a fixed speed, the moment a line is
 * crossed. The result reads as a canned intro: it looks the same whether the
 * reader eased in or threw the page, and it is over before they have arrived.
 * Here the stagger runs along the scroll itself, so the figures or the cards
 * land one after another at whatever pace the reader is moving, and reverse if
 * they scroll back.
 *
 * Scale is in this because opacity and offset alone read as a slide. Coming up
 * from 0.94 makes each item look like it is settling into the page rather than
 * sliding onto it - the same reason a photograph that grows slightly as it
 * enters feels present and one that only fades feels printed.
 *
 * `exit` is off by default. Most sections that use this already have
 * `sectionFlow` on the section itself, and two departures multiply: a section
 * at 0.32 holding items at 0.35 is 0.11, which is not depth, it is a bug.
 * Turn it on only for a section that has no flow of its own.
 */
export function scrubItems(
  mm: MatchMedia,
  root: Element,
  targets: Targets,
  {
    y = 34,
    scale = 0.94,
    stagger = 0.09,
    exit = false,
    start = 'top 92%',
    end = 'bottom 30%',
  }: {
    y?: number;
    scale?: number;
    stagger?: number;
    exit?: boolean;
    start?: string;
    end?: string;
  } = {},
) {
  mm.add(MQ.motionOk, () => {
    const els = gsap.utils.toArray<HTMLElement>(targets);
    if (els.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start, end, scrub: 0.6 },
    });

    tl.fromTo(
      els,
      { opacity: 0, y, scale, force3D: true },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'none',
        // `each` rather than `amount`: the gap between items stays constant as
        // the group grows, so four figures and five cards feel like the same
        // cadence instead of the larger group racing to fit the same window.
        stagger: { each: stagger },
        duration: exit ? 0.46 : 1,
      },
    );

    if (exit) {
      tl.to(els, { duration: 0.3 }).to(els, {
        opacity: 0.3,
        y: -20,
        ease: 'none',
        stagger: { each: stagger * 0.6 },
        duration: 0.24,
      });
    }
  });
}

// -----------------------------------------------------------------------------
// textReveal — masked line/character reveal
// -----------------------------------------------------------------------------

/**
 * Re-paint a clipped-gradient heading onto its split fragments.
 *
 * `background-clip: text` is painted by the element that owns the background.
 * Once SplitText moves the glyphs into child spans — which GSAP then transforms
 * into their own layers — the parent's clip no longer covers them, and every
 * fragment inherits `-webkit-text-fill-color: transparent` with no background of
 * its own. The text becomes genuinely invisible.
 *
 * The fix is to give each fragment the same gradient, sized to the whole phrase
 * and offset by that fragment's position, so the pieces reassemble one
 * continuous sweep — and now it travels with the glyph as it moves.
 *
 * Must run after splitting and before any transform is applied, while
 * getBoundingClientRect still reports untransformed positions.
 */
function repaintGradientFragments(scope: HTMLElement) {
  scope.querySelectorAll<HTMLElement>('.text-brand-gradient').forEach((phrase) => {
    const image = getComputedStyle(phrase).backgroundImage;
    if (!image || image === 'none') return;
    const box = phrase.getBoundingClientRect();

    phrase.querySelectorAll<HTMLElement>('*').forEach((fragment) => {
      if (fragment.children.length > 0) return; // leaves only
      const rect = fragment.getBoundingClientRect();
      fragment.style.backgroundImage = image;
      fragment.style.backgroundSize = `${box.width}px ${box.height}px`;
      fragment.style.backgroundPosition = `${box.left - rect.left}px ${box.top - rect.top}px`;
      fragment.style.backgroundClip = 'text';
      fragment.style.webkitBackgroundClip = 'text';
      fragment.style.webkitTextFillColor = 'transparent';
    });
  });
}

export type TextRevealOptions = {
  /** 'chars' staggers per glyph; 'words' is safer for mixed-direction copy. */
  by?: 'chars' | 'words';
  stagger?: number;
  duration?: number;
  delay?: number;
  /** Omit to play on mount (above-the-fold headings). */
  start?: string;
  /** Called once the reveal is set up — used to release the CSS safety net. */
  onReady?: () => void;
};

export function textReveal(
  mm: MatchMedia,
  target: Targets,
  { by = 'chars', stagger = 0.02, duration = 0.8, delay = 0, start, onReady }: TextRevealOptions = {},
) {
  mm.add(MQ.motionOk, () => {
    // If the chunk arrived so late that the safety fade has already shown the
    // heading, animating now would drop it back down and lift it again. Reveal
    // it and move on.
    if (!start && isLateBoot()) {
      onReady?.();
      return;
    }

    // `mask: 'lines'` wraps each line in an overflow-clipped box, so glyphs rise
    // out from behind the line above instead of fading in place.
    // `aria: 'auto'` (SplitText's default) labels the container and hides the
    // fragments, so a screen reader still reads one sentence.
    const split = SplitText.create(target as gsap.DOMTarget, {
      type: by === 'chars' ? 'lines,chars' : 'lines,words',
      mask: 'lines',
    });

    const root = gsap.utils.toArray<HTMLElement>(target)[0];
    if (root) repaintGradientFragments(root);

    const pieces = by === 'chars' ? split.chars : split.words;

    let reverted = false;
    const restore = () => {
      if (reverted) return;
      reverted = true;
      split.revert();
    };

    gsap.from(pieces, {
      yPercent: 110,
      opacity: 0,
      duration,
      delay,
      stagger,
      ease: 'power4.out',
      // Undo the split as soon as the reveal is over. The heading goes back to
      // being one element, which means its real CSS gradient takes over from the
      // per-fragment repaint, screen readers see plain markup again, and a later
      // window resize reflows the text normally instead of keeping line breaks
      // that were measured at the old width.
      onComplete: restore,
      ...(start
        ? { scrollTrigger: { trigger: target as gsap.DOMTarget, start, once: true } }
        : {}),
    });

    onReady?.();
    return restore;
  });

  // With reduced motion no condition matches, so the safety net must still be
  // released or the heading would stay hidden.
  mm.add(MQ.reduced, () => {
    onReady?.();
  });
}

// -----------------------------------------------------------------------------
// parallax — desktop only (§4: no scrub below 1024px)
// -----------------------------------------------------------------------------

export type ParallaxOptions = {
  /** Positive drifts down (slower than scroll), negative drifts up. */
  yPercent?: number;
  trigger?: Element | null;
};

export function parallax(
  mm: MatchMedia,
  target: Targets,
  { yPercent = 12, trigger }: ParallaxOptions = {},
) {
  mm.add(MQ.desktop, () => {
    gsap.to(target, {
      yPercent,
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: trigger ?? (gsap.utils.toArray<HTMLElement>(target)[0] as Element),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}

// -----------------------------------------------------------------------------
// pinSection — desktop only. Horizontal travel is direction-aware.
// -----------------------------------------------------------------------------

export type PinSectionOptions = {
  /** The element that slides. Omit for a pin with no travel. */
  track?: HTMLElement | null;
  /** Extra scroll distance as a multiple of viewport height. */
  scrub?: boolean | number;
};

export function pinSection(
  mm: MatchMedia,
  root: HTMLElement,
  { track, scrub = 1 }: PinSectionOptions = {},
) {
  mm.add(MQ.desktop, () => {
    // Distance the track must travel to bring its far edge into view.
    const distance = () => (track ? Math.max(0, track.scrollWidth - root.clientWidth) : 0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${distance() + window.innerHeight}`,
        pin: true,
        scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    if (track) {
      // dirX flips the travel so the track moves right-to-left in Hebrew.
      tl.to(track, { x: () => dirX(distance()), ease: 'none' });
    }

    return tl;
  });
}

// -----------------------------------------------------------------------------
// horizontalStages — the pinned BUILD/BRAND/GROW track. Desktop only.
// -----------------------------------------------------------------------------

export type HorizontalStagesOptions = {
  track: HTMLElement;
  items: HTMLElement[];
  /** Element whose width the track has to clear. Defaults to the root. */
  viewport?: HTMLElement;
  /**
   * What actually gets pinned. Must be the whole section: pinning an inner
   * wrapper leaves the section heading to scroll away on its own while the
   * cards sit fixed at the top of the viewport, overlapping whatever comes
   * next. Defaults to the nearest ancestor <section>.
   */
  pin?: HTMLElement;
  /** Settle on one stage at a time instead of stopping mid-way between two. */
  snap?: boolean;
  /** Resting opacity of the stages that are not currently lit. High enough
   *  to stay readable — the glow is what marks the active one. */
  dim?: number;
  /** Optional 0-1 progress reporter, for a progress rail. */
  onProgress?: (value: number) => void;
};

export function horizontalStages(
  mm: MatchMedia,
  root: HTMLElement,
  { track, items, viewport, pin, snap = true, dim = 0.45, onProgress }: HorizontalStagesOptions,
) {
  mm.add(MQ.desktop, () => {
    const frame = viewport ?? root;
    const pinTarget = pin ?? root.closest('section') ?? root;
    const distance = () => Math.max(0, track.scrollWidth - frame.clientWidth);
    if (distance() === 0) return;

    const last = items.length - 1;

    const glowOf = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-stage-glow]');

    gsap.set(items.slice(1), { opacity: dim, scale: 0.955, force3D: true });
    items.forEach((el, i) => {
      const glow = glowOf(el);
      if (glow) gsap.set(glow, { opacity: i === 0 ? 1 : 0 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinTarget,
        start: 'top top',
        // Scroll length = the travel distance, so the track moves at the same
        // rate as the wheel and the pin releases exactly when it lands.
        end: () => `+=${distance()}`,
        pin: pinTarget,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // One stage per step, so the section reads as progress through a
        // sequence rather than as a slider that can rest between two cards.
        snap:
          snap && last > 0
            ? { snapTo: 1 / last, duration: { min: 0.15, max: 0.4 }, delay: 0.04, ease: 'power2.inOut' }
            : undefined,
        onUpdate: onProgress ? (self) => onProgress(self.progress) : undefined,
      },
    });

    /*
     * Travel direction.
     *
     * `dirX(v)` maps "move FORWARD in reading direction". The track has to move
     * BACKWARD, so that content sitting outside the container comes into view —
     * hence the negation. In a Hebrew flex row the overflow sits to the LEFT of
     * the container, so the track moves RIGHT (+x) to reveal it; in English it
     * is the mirror image.
     *
     * Getting this backwards is silent: the stages still light up in order
     * because that is driven by timeline position, while the cards being lit are
     * off screen. It read as "working" until the visible cards were checked
     * against the lit one.
     */
    tl.to(track, { x: () => -dirX(distance()), ease: 'none', duration: 1 }, 0);

    // Light each stage as it reaches the middle, and dim it again as it leaves.
    // Positions align with the snap points so a settled scroll always leaves
    // exactly one stage lit.
    const FADE = 0.12;

    items.forEach((el, i) => {
      const at = last > 0 ? i / last : 0;
      const glow = glowOf(el);

      if (i > 0) {
        const on = Math.max(0, at - FADE);
        tl.to(el, { opacity: 1, scale: 1, duration: FADE, ease: 'none' }, on);
        if (glow) tl.to(glow, { opacity: 1, duration: FADE, ease: 'none' }, on);
      }
      if (i < last) {
        const off = Math.min(1, at + FADE * 0.5);
        tl.to(el, { opacity: dim, scale: 0.955, duration: FADE, ease: 'none' }, off);
        if (glow) tl.to(glow, { opacity: 0, duration: FADE, ease: 'none' }, off);
      }
    });

    return tl;
  });
}

// -----------------------------------------------------------------------------
// scrubDraw — draw an SVG path in step with the scroll. Desktop only.
// -----------------------------------------------------------------------------

export function scrubDraw(
  mm: MatchMedia,
  path: SVGPathElement | SVGLineElement,
  { trigger, start = 'top 80%', end = 'bottom 60%' }: { trigger: Element; start?: string; end?: string },
) {
  mm.add(MQ.motionOk, () => {
    const length = 'getTotalLength' in path ? path.getTotalLength() : 0;
    if (!length) return;
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger, start, end, scrub: 0.5, invalidateOnRefresh: true },
    });
  });
}

// -----------------------------------------------------------------------------
// Counting numbers live in components/ui/counting-number.tsx, not here.
//
// There was a GSAP countUp primitive at this point. It was removed when the
// stats bar moved to the framer-motion component the owner chose: two
// implementations of the same effect, in two different animation libraries,
// is how one of them quietly stops matching the other.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// stackCards — desktop only. Cards pile up and recede as the next one arrives.
// -----------------------------------------------------------------------------

export function stackCards(mm: MatchMedia, cards: Targets, { scale = 0.94 } = {}) {
  mm.add(MQ.desktop, () => {
    const els = gsap.utils.toArray<HTMLElement>(cards);
    els.forEach((card, i) => {
      if (i === els.length - 1) return;
      gsap.to(card, {
        scale,
        opacity: 0.4,
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: els[i + 1],
          start: 'top bottom',
          end: 'top center',
          scrub: true,
        },
      });
    });
  });
}
