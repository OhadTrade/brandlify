/**
 * The B, as geometry.
 *
 * Not traced by eye: both the cell map and the colours below are measured
 * from the artwork by scripts/measure-mark.mjs, which lays a 3x4 grid over
 * assets/source/mark-3d.png and probes each of the four possible right
 * triangles per cell against the alpha channel. Every cell resolves decisively
 * — solid triangles read 0.99, absent ones 0.00-0.17.
 *
 * Everything sits on a 45deg grid, which is the whole construction logic of the
 * logo and the reason the UI uses 45deg chamfers elsewhere.
 */

export type TriangleKind = 'UR' | 'LL' | 'UL' | 'LR';
export type Cell = TriangleKind | 'FULL' | '.';

export const COLS = 3;
export const ROWS = 4;

/**
 * Row 0 is the top of the mark, column 0 the left.
 *
 * Re-measured from assets/source/mark-3d.png by scripts/measure-mark.mjs. The
 * original map came from public/brand/mark.png, a low-resolution export in
 * which the counters — the two holes that make a B a B instead of a filled
 * block — are muddied shut, so the extractor faithfully reported a solid grid.
 *
 * The middle column carries them, and note that (1,1) is 'LR': it is the one
 * cell that runs on the OTHER diagonal. That is not a stylistic flourish, it is
 * what shapes the upper counter — a cell split the same way as its neighbours
 * would leave a triangle where the hole belongs.
 */
export const CELLS: Cell[][] = [
  ['UR', 'FULL', 'LL'],
  ['FULL', 'LR', 'UL'],
  ['FULL', 'UR', 'LL'],
  ['UL', 'FULL', 'UL'],
];

/** Corners in cell-local coordinates, v pointing down as in the image. */
const CORNERS: Record<TriangleKind, [number, number][]> = {
  UR: [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  LL: [
    [0, 0],
    [1, 1],
    [0, 1],
  ],
  UL: [
    [0, 0],
    [1, 0],
    [0, 1],
  ],
  LR: [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
};

export type Facet = {
  key: string;
  /** Triangle corners in world XY, already centred on the origin. */
  points: [number, number][];
  /** Extrusion depth — varied so the facets catch light at different angles. */
  depth: number;
  /** 0 at the bottom-left of the mark, 1 at the top-right. Drives the colour. */
  ramp: number;
};

/** Pull a triangle's corners toward its centroid so facets read as separate pieces. */
function inset(points: [number, number][], amount: number): [number, number][] {
  const cx = (points[0]![0] + points[1]![0] + points[2]![0]) / 3;
  const cy = (points[0]![1] + points[1]![1] + points[2]![1]) / 3;
  return points.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return [x - (dx / len) * amount, y - (dy / len) * amount] as [number, number];
  });
}

/**
 * Cut every corner back along both of its edges, turning each triangle into a
 * hexagon with three long sides and three short corner flats.
 *
 * This exists because of how ExtrudeGeometry builds a bevel. It offsets the
 * outline along each corner's angle bisector, by bevelSize / sin(theta / 2).
 * That denominator is the whole problem: a right triangle has two 45deg
 * corners, where sin(22.5deg) = 0.383 and the outline is therefore pushed out
 * 2.6x further than the bevel is wide. The visible result is a needle sticking
 * out of the sharp end of every facet, and eighteen facets means thirty-six
 * needles.
 *
 * Truncating first turns each 45deg corner into two of roughly 112deg, where
 * the factor falls to 1.2, and leaves a flat long enough to absorb what is
 * left. Cut glass and machined metal have corner flats for the same physical
 * reason: an edge that thin does not survive being made.
 *
 * Off by default. The 2D generators have no bevel and therefore no needles, and
 * a triangle is the honest shape for them.
 */
function truncate(points: [number, number][], amount: number): [number, number][] {
  if (amount <= 0) return points;
  const n = points.length;
  const out: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const p = points[i]!;
    const prev = points[(i - 1 + n) % n]!;
    const next = points[(i + 1) % n]!;

    // Prev side first, then next side, so the polygon keeps its winding.
    for (const q of [prev, next]) {
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const len = Math.hypot(dx, dy) || 1;
      // Never cut past 45% of an edge: two corners eating the same short edge
      // from both ends would cross over and invert the outline.
      const t = Math.min(amount, len * 0.45) / len;
      out.push([p[0] + dx * t, p[1] + dy * t]);
    }
  }

  return out;
}

/**
 * Flatten the cell map into individual triangles positioned in world space.
 * The mark is centred on the origin and one cell is one unit.
 */
export function buildFacets({ gap = 0.045, corner = 0, depth = 0.28 } = {}): Facet[] {
  const facets: Facet[] = [];

  CELLS.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === '.') return;
      const kinds: TriangleKind[] = cell === 'FULL' ? ['UR', 'LL'] : [cell];

      kinds.forEach((kind) => {
        const points = CORNERS[kind].map(([u, v]) => {
          // Image space (v down) -> world space (Y up), centred.
          const x = c + u - COLS / 2;
          const y = ROWS / 2 - (r + v);
          return [x, y] as [number, number];
        });

        const cx = (points[0]![0] + points[1]![0] + points[2]![0]) / 3;
        const cy = (points[0]![1] + points[1]![1] + points[2]![1]) / 3;

        // Diagonal position, bottom-left to top-right — the direction the
        // artwork runs from deep indigo into magenta.
        const ramp = (cx / COLS + 0.5 + (cy / ROWS + 0.5)) / 2;

        facets.push({
          key: `${r}-${c}-${kind}`,
          points: truncate(inset(points, gap), corner),
          // Uniform. The facets used to alternate between two depths so
          // neighbours never sat flush, which read as a pile of tiles; the mark
          // is meant to be one solid plate with grooves cut between the facets,
          // and every edge landing on the same plane is what lets a single
          // highlight run across several of them at once.
          depth,
          ramp,
        });
      });
    });
  });

  // Stretch the ramp across the facets that actually exist. Centroids sit well
  // inside the grid, so the raw values only span roughly 0.2-0.8 — leaving both
  // ends of the colour ramp unused and the mark reading as one flat violet
  // instead of running indigo to magenta the way the logo does.
  const values = facets.map((f) => f.ramp);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1e-6);
  for (const facet of facets) {
    facet.ramp = (facet.ramp - min) / span;
  }

  return facets;
}

/**
 * Sampled from assets/source/mark-3d.png by scripts/measure-mark.mjs.
 *
 * `base` is the median colour of the facet's front face; `light` and `dark`
 * are the 90th and 12th percentiles by luminance — the range the render
 * actually paints across that triangle, rather than a lightened and darkened
 * guess at it.
 */
export const FACET_COLOURS: Record<string, { base: string; light: string; dark: string }> = {
  '0-0-UR': { base: '#891bf9', light: '#a432fb', dark: '#601af4' },
  '0-1-UR': { base: '#e801d5', light: '#fc57e0', dark: '#2e0216' },
  '0-1-LL': { base: '#dd02f7', light: '#fc5cf6', dark: '#2d0021' },
  '0-2-LL': { base: '#fc85e9', light: '#fbafed', dark: '#fc5cd6' },
  '1-0-UR': { base: '#6a2afd', light: '#fb69fb', dark: '#23088e' },
  '1-0-LL': { base: '#6d31fa', light: '#ee52fb', dark: '#1e069a' },
  '1-1-LR': { base: '#9223e1', light: '#de2ffa', dark: '#6824d3' },
  '1-2-UL': { base: '#e903b4', light: '#fb10bb', dark: '#e602a0' },
  '2-0-UR': { base: '#6827fc', light: '#504bfb', dark: '#4c21fa' },
  '2-0-LL': { base: '#2724ac', light: '#393ad9', dark: '#1b1685' },
  '2-1-UR': { base: '#5c02c5', light: '#6502cf', dark: '#5001aa' },
  '2-2-LL': { base: '#eb02f9', light: '#fd06fd', dark: '#be02f5' },
  '3-0-UL': { base: '#23087b', light: '#1d1277', dark: '#1c0970' },
  '3-1-UR': { base: '#201888', light: '#4c21e3', dark: '#090546' },
  '3-1-LL': { base: '#350cc6', light: '#3e1dd4', dark: '#040339' },
  '3-2-UL': { base: '#7501b1', light: '#9501ce', dark: '#56029c' },
};

/** The artwork's own colour for a facet, with a safe fallback. */
export function facetColour(key: string) {
  return FACET_COLOURS[key] ?? { base: '#6a2bc4', light: '#9b5cee', dark: '#3a107a' };
}
