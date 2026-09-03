/**
 * Extracts the exact triangle map of the B mark on its 3x4 cell grid.
 *
 * Each cell can hold up to two right triangles. There are four candidates —
 * the two halves of the "\" diagonal and the two halves of the "/" diagonal —
 * and each is measured against the artwork's alpha channel independently.
 *
 * Output feeds src/components/hero/markGeometry.ts.
 */
import sharp from 'sharp';

const SRC = 'public/brand/mark.png';
const COLS = 3;
const ROWS = 4;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const opaque = (x, y) =>
  x >= 0 && y >= 0 && x < W && y < H && data[(y * W + x) * C + 3] > 128;

const cw = W / COLS;
const ch = H / ROWS;

/**
 * u,v are cell-local coordinates in [0,1].
 *   UR: above the "\" diagonal   (v < u)
 *   LL: below the "\" diagonal   (v > u)
 *   UL: above the "/" diagonal   (u + v < 1)
 *   LR: below the "/" diagonal   (u + v > 1)
 */
const TRIANGLES = {
  UR: (u, v) => v < u,
  LL: (u, v) => v > u,
  UL: (u, v) => u + v < 1,
  LR: (u, v) => u + v > 1,
};

function triangleCoverage(col, row, test) {
  const x0 = col * cw;
  const y0 = row * ch;
  let on = 0;
  let total = 0;
  const step = 1;
  for (let y = y0 + 2; y < y0 + ch - 2; y += step) {
    for (let x = x0 + 2; x < x0 + cw - 2; x += step) {
      const u = (x - x0) / cw;
      const v = (y - y0) / ch;
      // Ignore a band around the diagonal — the render's edges are soft.
      if (!test(u, v)) continue;
      const distToDiag = Math.min(Math.abs(v - u), Math.abs(u + v - 1));
      if (distToDiag < 0.12) continue;
      total++;
      if (opaque(Math.round(x), Math.round(y))) on++;
    }
  }
  return total ? on / total : 0;
}

const PRESENT = 0.72;
const rows = [];

console.log('Triangle coverage per cell (UR LL UL LR):\n');
for (let r = 0; r < ROWS; r++) {
  const line = [];
  const cells = [];
  for (let c = 0; c < COLS; c++) {
    const cov = Object.fromEntries(
      Object.entries(TRIANGLES).map(([k, t]) => [k, triangleCoverage(c, r, t)]),
    );
    line.push(
      Object.entries(cov)
        .map(([k, v]) => `${k}:${v.toFixed(2)}`)
        .join(' '),
    );

    // Decide the cell: full if both halves of a diagonal are present, otherwise
    // the single best-covered triangle.
    const full = cov.UR >= PRESENT && cov.LL >= PRESENT;
    if (full) {
      cells.push('FULL');
    } else {
      const [best, bestCov] = Object.entries(cov).sort((a, b) => b[1] - a[1])[0];
      cells.push(bestCov >= PRESENT ? best : '.');
    }
  }
  console.log(`row ${r}:`);
  line.forEach((l, i) => console.log(`   c${i}  ${l}`));
  rows.push(cells);
}

console.log('\nCell map:');
for (const row of rows) console.log('  ' + row.map((c) => c.padEnd(5)).join(''));

console.log('\nAs code:');
console.log(
  'export const CELLS = ' +
    JSON.stringify(rows).replace(/\],\[/g, '],\n  [').replace('[[', '[\n  [').replace(']]', '],\n]'),
);
