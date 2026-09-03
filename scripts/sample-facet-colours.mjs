/**
 * Reads the real colour of every triangle straight out of the logo artwork.
 *
 * The 3D mark was previously coloured by an invented gradient ramp, which never
 * quite matched the logo. Rather than keep tuning stops by eye, this samples the
 * artwork itself: for each facet it averages the pixels inside that triangle and
 * emits the result, so the 3D B is painted with the logo's own palette.
 *
 * Also emits a light and a dark variant per facet, taken from the brightest and
 * darkest quartiles inside the triangle — those drive the bevel shading, so the
 * highlights land where the artwork already has them.
 *
 * Run: node --import ./scripts/ts-alias-hook.mjs scripts/sample-facet-colours.mjs
 */
import sharp from 'sharp';
import { buildFacets, COLS, ROWS } from '@/components/hero/markGeometry';

const SRC = 'public/brand/mark.png';

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

/** World XY (centred, Y up) -> pixel coordinates in the artwork. */
const toPixel = (x, y) => [((x + COLS / 2) / COLS) * W, ((ROWS / 2 - y) / ROWS) * H];

/** Barycentric test so only pixels actually inside the triangle are sampled. */
function inside(px, py, tri) {
  const [[ax, ay], [bx, by], [cx, cy]] = tri;
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  const a = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d;
  const b = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d;
  return a >= 0 && b >= 0 && a + b <= 1;
}

const hex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];

// gap 0 so each sample covers the whole triangle as the artwork draws it.
const facets = buildFacets({ gap: 0 });
const results = [];

for (const facet of facets) {
  const tri = facet.points.map(([x, y]) => toPixel(x, y));
  const xs = tri.map((p) => p[0]);
  const ys = tri.map((p) => p[1]);

  const pixels = [];
  for (let y = Math.floor(Math.min(...ys)); y < Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x < Math.ceil(Math.max(...xs)); x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = (y * W + x) * C;
      if (data[i + 3] < 200) continue;
      // Shrink toward the centroid a little so edge seams are not sampled.
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
      const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      const sx = cx + (x - cx) * 0.82;
      const sy = cy + (y - cy) * 0.82;
      if (!inside(sx, sy, tri)) continue;
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (pixels.length === 0) {
    results.push({ key: facet.key, base: '#6a2bc4', light: '#9b5cee', dark: '#3a107a' });
    continue;
  }

  pixels.sort((p, q) => lum(p) - lum(q));
  const mean = (list) =>
    list.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((v) => v / list.length);

  const q = Math.max(1, Math.floor(pixels.length / 4));
  results.push({
    key: facet.key,
    base: hex(mean(pixels)),
    dark: hex(mean(pixels.slice(0, q))),
    light: hex(mean(pixels.slice(-q))),
  });
}

console.log('/** Sampled from the artwork by scripts/sample-facet-colours.mjs. */');
console.log('export const FACET_COLOURS: Record<string, { base: string; light: string; dark: string }> = {');
for (const r of results) {
  console.log(`  '${r.key}': { base: '${r.base}', light: '${r.light}', dark: '${r.dark}' },`);
}
console.log('};');
