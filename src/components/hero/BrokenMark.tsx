import { buildFacets, facetColour } from './markGeometry';

/**
 * The B, come apart — the 404 illustration.
 *
 * Plain SVG built from the same extracted facet map as the 3D hero, so it is
 * unmistakably the same mark rather than a separate drawing. No Three.js on an
 * error page.
 *
 * Facets carry the logo's own sampled colours, so the shattered mark is
 * recognisably the same object as the hero.
 *
 * The scatter is derived from each facet's index, not Math.random, so the
 * server and the client produce identical markup and there is no hydration
 * mismatch. Drift is CSS-only and stops dead under prefers-reduced-motion.
 */
export function BrokenMark() {
  const facets = buildFacets({ gap: 0.06 });

  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div
        className="pointer-events-none absolute inset-0 m-auto h-[70%] w-[70%] rounded-full opacity-60 blur-[90px]"
        style={{
          background:
            'radial-gradient(circle, rgb(230 53 240 / 0.3), rgb(131 47 240 / 0.2) 50%, transparent 72%)',
        }}
      />

      <svg viewBox="-2.6 -2.8 5.2 5.6" className="relative w-full" role="presentation">
        {facets.map((facet, i) => {
          // Deterministic pseudo-random offsets from the index.
          const wobble = (n: number, spread: number) =>
            ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) * spread;
          const dx = wobble(1, 0.5);
          const dy = wobble(2, 0.5);
          const rotate = wobble(3, 28);
          const delay = Math.abs(wobble(4, 4));

          return (
            <polygon
              key={facet.key}
              points={facet.points.map(([x, y]) => `${x},${-y}`).join(' ')}
              fill={facetColour(facet.key).base}
              stroke="rgb(250 250 252 / 0.14)"
              strokeWidth="0.012"
              className="broken-facet"
              style={{
                transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`,
                transformOrigin: 'center',
                transformBox: 'fill-box',
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
