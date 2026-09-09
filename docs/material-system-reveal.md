# Material System Reveal and service artwork

Implemented and checked locally on 2026-09-09 on branch `codex/material-system-reveal`.

## Scope and material limitation

The active homepage uses `HeroExperience` and the approved `public/brand/flowing-b.webp`.
There is no editable 3D model of that flowing logo in the repository. The older
`MarkStage` / `HeroMark3D` renders a different, triangular logo and is not used here.

The new renderer is **image-based 2.5D relief**, not a newly modelled glass object.
It preserves the approved raster, adds shallow depth, a moving edge highlight,
restrained coral/violet illumination, and a curved-band convergence over 1.3 seconds.
It does not provide independently modelled facets, physically accurate refraction,
new views of the back of the logo, or a true geometric assembly. Those require an
approved GLB or editable model of this exact logo. No SVG or replacement logo was invented.

## Behaviour

- Desktop with a fine pointer and sufficient resources: lazy WebGL2 enhancement;
  pointer rotation limited to roughly 4 degrees vertically and 6 degrees horizontally.
- Pointer easing uses exponential damping. No React state changes occur per frame.
- Rendering is demand-driven: stops at rest, outside the HERO, or when the document
  is hidden. Resize and pointer movement wake it only while active.
- ScrollTrigger scales, rotates, shifts toward the header brand and fades the visual.
  It does not pin the HERO or animate layout dimensions.
- Touch/mobile, reduced motion, no WebGL2, low memory/core counts, data saver,
  context loss, import failures or sustained poor frame pacing keep the static image.
- Late loading skips the WebGL entrance instead of hiding an already visible logo.
- The image is present in server HTML, decorative and aria-hidden. Text and links
  work without JavaScript. The image box reserves its aspect ratio.
- Homepage copy enters independently in 740ms total, using 60ms stagger intervals.
- Only the HERO image is preloaded on the homepage; service pages preload their
  own corresponding HERO illustration. Card images remain lazy.

## Changed files

| File | Change |
| --- | --- |
| `src/components/home/HeroExperience.tsx` | Capability gates, texture decoding, pointer events, visibility handling, scroll exit, cleanup and fallback. |
| `src/components/home/materialReveal.ts` | New demand-driven Three.js relief renderer and material shaders. |
| `src/app/(site)/page.tsx` | Revised Hebrew headline, eyebrow, supporting copy, primary contact CTA, secondary portfolio CTA, reassurance, decorative logo, shared service artwork mapping. Anchor links now use Next Link to preserve route history. |
| `src/components/home/studio.module.css` | Shorter HERO, text hierarchy, coloured primary CTA, separate copy entrance, compact mobile logo after full-width CTA, quieter section anchors. |
| `src/components/layout/StudioChrome.tsx` | Short header CTA, scroll-state attribute, header brand target. |
| `src/components/layout/studio-chrome.module.css` | Glass only after scrolling, softer brand-image edge, reduced-motion treatment. |
| `src/lib/service-artwork.ts` | One canonical mapping for all five service images, shared between homepage and destination pages. |
| `src/components/sections/ServiceArtwork.tsx` | Replace CSS placeholders with the same existing WebP illustrations, desktop pointer tilt, static touch/reduced-motion rendering. Also updates the services listing through its existing use of this component. |
| `src/components/sections/editorial.module.css` | Remove obsolete placeholder shapes; reserve square image space and size illustrations responsively. |
| `src/app/(site)/services/[slug]/page.tsx` | Prioritize the correct service HERO image. |
| `scripts/check-hero.mjs` | Browser checks for renderer lifecycle, fallbacks, both mobile sizes, focus/active states, CTA navigation, history, overflow, LCP and CLS. |
| `scripts/check-service-art.mjs` | Follow all five homepage cards, compare actual image URLs to each destination and services listing, test desktop/mobile/reduced motion. |

## Verification

Lint, typecheck and the production build passed. Homepage First Load JS is 117 kB;
service pages are 114 kB. Three.js is dynamically imported after desktop capability
checks, not included in the initial route payload. No new dependencies were added.

The final production build was served locally at `http://localhost:3010` and checked
in Edge with Playwright, plus a visual check in the Codex browser.

- HERO: 1440x900, 390x844 and 375x812; context loss, no WebGL, live reduced-motion
  switching, low-memory fallback, no JavaScript, pointer response, rendering pause
  offscreen, rendering idle at rest, re-entry, keyboard focus, press and both CTAs.
- All 15 service combinations (five slugs x desktop/mobile/reduced motion) passed.
  The services listing also uses the matching images. No horizontal overflow or
  browser errors were detected in these checks.
- Local, unthrottled lab samples: desktop LCP 260ms / CLS 0.000337; 390px mobile
  LCP 148ms / CLS 0; 375px mobile LCP 128ms / CLS 0. These are not Lighthouse scores,
  physical-device measurements, or production field data. No-JS vitals are not
  measurable by the script; static content and image visibility were checked.
- Back navigation after a native homepage hash link originally left the portfolio
  content at the homepage URL. Using Next Link for the homepage anchors fixed the
  reproduced route mismatch, verified through real navigation.

Screenshots and machine-readable results are saved outside build output in
`../../outputs/hero-material-review/` relative to this repository root.

The test scripts use an existing Playwright installation via `HERO_PLAYWRIGHT`,
with optional `HERO_TEST_URL` and `HERO_TEST_OUTPUT`. They use Edge and do not submit
forms or write to the site's database. Document-hidden pausing is implemented but
not separately automated; physical mobile devices and Safari were not tested.

The checks above describe the local production build. GitHub commit and Vercel
deployment status are tracked separately in the pull request for this branch.
