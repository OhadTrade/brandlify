/**
 * Measures the mark's cell map and per-facet colours from the 3D artwork.
 *
 * Supersedes extract-triangles.mjs + sample-facet-colours.mjs, which both read
 * public/brand/mark.png — a small, murky export in which the B's two counters
 * are muddied shut and the colours carry the flat drawing's own baked shading.
 * assets/source/mark-3d.png is the clean render, so both the shape and the
 * palette are taken from it instead.
 *
 * The grid is anchored on landmarks rather than fitted blind, because the
 * render has enough perspective that a free search slides off and settles on
 * whatever the edge of its range happens to be:
 *
 *   - origin: the top-left corner of the flat face
 *   - cell width: the opaque run along the very top spans exactly two cells,
 *     since row 0 is UR | FULL | LL and an LL contributes only its top vertex
 *   - cell height: the lowest opaque pixel in column 0 is the far corner of
 *     row 3's UL
 *
 * Run: node scripts/measure-mark.mjs
 * Output is pasted into src/components/hero/markGeometry.ts.
 */
import sharp from 'sharp';

const SRC = 'assets/source/mark-3d.png';
const COLS = 3;
const ROWS = 4;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const at = (x, y) => {
  const i = (Math.round(y) * W + Math.round(x)) * C;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};
const alpha = (x, y) =>
  x < 0 || y < 0 || x >= W || y >= H ? 0 : at(x, y)[3];

/** The image is already trimmed to the flat face's top-left corner. */
const ox = 0;
const oy = 0;

/** Opaque run along the top row: two cells wide. */
let firstTop = -1;
let lastTop = -1;
for (let x = 0; x < W; x++) {
  if (alpha(x, 8) > 200) {
    if (firstTop < 0) firstTop = x;
    lastTop = x;
  }
}
const cw = (lastTop - firstTop + 1) / 2;

/** Lowest opaque pixel just inside the left edge: row 3's UL far corner. */
const probeX = firstTop + cw * 0.03;
let lowest = 0;
for (let y = H - 1; y >= 0; y--) {
  if (alpha(probeX, y) > 200) {
    lowest = y;
    break;
  }
}
const ch = (lowest - oy) / (ROWS - 1 + 0.97);

console.log(`grid: origin (${ox}, ${oy})  cell ${cw.toFixed(1)} x ${ch.toFixed(1)}`);
console.log(`      ${COLS} x cw = ${(COLS * cw).toFixed(0)} (image width ${W})\n`);

/** Centroids in cell-local coordinates, far from every edge. */
const CENTROID = {
  UR: [2 / 3, 1 / 3],
  LL: [1 / 3, 2 / 3],
  UL: [1 / 3, 1 / 3],
  LR: [2 / 3, 2 / 3],
};

/** Mean alpha over a disc, so a stray pixel cannot decide a cell. */
function solid(x, y, r = Math.round(cw / 20)) {
  let sum = 0;
  let n = 0;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      sum += alpha(x + dx, y + dy);
      n++;
    }
  }
  return sum / n / 255;
}

const cells = [];
for (let r = 0; r < ROWS; r++) {
  const row = [];
  for (let c = 0; c < COLS; c++) {
    const x0 = ox + c * cw;
    const y0 = oy + r * ch;
    const m = Object.fromEntries(
      Object.entries(CENTROID).map(([k, [u, v]]) => [k, solid(x0 + u * cw, y0 + v * ch)]),
    );

    // Order matters, and the obvious order is wrong. Testing FULL first
    // (UR and LL both solid) swallows every "/" cell: on a UL, the UR and LL
    // centroids sit exactly ON the diagonal, so their discs straddle the edge
    // with the filled side winning and both read ~1. The tests that can only
    // pass for one diagonal have to run before the one that both can pass.
    let kind = '.';
    if (m.UL > 0.8 && m.LR < 0.4) kind = 'UL';
    else if (m.LR > 0.8 && m.UL < 0.4) kind = 'LR';
    else if (m.UR > 0.8 && m.LL > 0.8) kind = 'FULL';
    else if (m.UR > 0.8) kind = 'UR';
    else if (m.LL > 0.8) kind = 'LL';

    row.push(kind);
    console.log(
      `(${r},${c}) ${kind.padEnd(4)}  ` +
        Object.entries(m)
          .map(([k, v]) => `${k}=${v.toFixed(2)}`)
          .join(' '),
    );
  }
  cells.push(row);
}

console.log('\nexport const CELLS: Cell[][] = [');
for (const row of cells) console.log(`  [${row.map((k) => `'${k}'`).join(', ')}],`);
console.log('];\n');

/** Which triangles a cell contains. */
const kindsOf = (cell) => (cell === 'FULL' ? ['UR', 'LL'] : cell === '.' ? [] : [cell]);

const TEST = {
  UR: (u, v) => v < u,
  LL: (u, v) => v > u,
  UL: (u, v) => u + v < 1,
  LR: (u, v) => u + v > 1,
};

const hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

console.log('export const FACET_COLOURS: Record<string, { base: string; light: string; dark: string }> = {');
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    for (const kind of kindsOf(cells[r][c])) {
      const x0 = ox + c * cw;
      const y0 = oy + r * ch;
      const [ku, kv] = CENTROID[kind];
      const pixels = [];

      for (let i = 1; i < 40; i++) {
        for (let j = 1; j < 40; j++) {
          const u = i / 40;
          const v = j / 40;
          if (!TEST[kind](u, v)) continue;
          // Pull each sample toward the centroid, so the chamfers and the
          // grooves between facets never enter the average.
          const su = ku + (u - ku) * 0.62;
          const sv = kv + (v - kv) * 0.62;
          const px = at(x0 + su * cw, y0 + sv * ch);
          if (px[3] < 200) continue;
          pixels.push(px);
        }
      }
      if (pixels.length === 0) continue;

      // Ordered by luminance: the median is the facet's colour, and the tails
      // are the range the render actually paints across it — which is what the
      // gradients elsewhere need, rather than a lightened and darkened guess.
      pixels.sort(
        (a, b) => a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722 - (b[0] * 0.2126 + b[1] * 0.7152 + b[2] * 0.0722),
      );
      const pick = (f) => pixels[Math.min(pixels.length - 1, Math.floor(pixels.length * f))];

      console.log(
        `  '${r}-${c}-${kind}': { base: '${hex(pick(0.5))}', light: '${hex(pick(0.9))}', dark: '${hex(pick(0.12))}' },`,
      );
    }
  }
}
console.log('};');
