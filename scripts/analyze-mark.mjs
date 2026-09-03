/**
 * Recovers the triangle grid the B mark is built on, so the 3D hero can be real
 * geometry rather than a guess at the shape.
 *
 * A correct grid makes every cell land near 0 (empty), 0.5 (one triangle) or
 * 1.0 (two triangles) coverage. Candidate grids are scored on exactly that.
 *
 * Run: node scripts/analyze-mark.mjs
 */
import sharp from 'sharp';

const SRC = 'public/brand/mark.png';

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const alphaAt = (x, y) => data[(y * W + x) * C + 3];

function coverage(x0, y0, w, h) {
  let on = 0;
  let total = 0;
  for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
    for (let x = Math.round(x0); x < Math.round(x0 + w); x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      total++;
      if (alphaAt(x, y) > 128) on++;
    }
  }
  return total ? on / total : 0;
}

function score(cols, rows) {
  const cw = W / cols;
  const ch = H / rows;
  let err = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = coverage(c * cw, r * ch, cw, ch);
      err += Math.min(Math.abs(v - 0), Math.abs(v - 0.5), Math.abs(v - 1)) ** 2;
    }
  }
  return {
    cols,
    rows,
    cell: `${(W / cols).toFixed(1)}x${(H / rows).toFixed(1)}`,
    err: +(err / (cols * rows)).toFixed(5),
  };
}

const results = [];
for (let cols = 3; cols <= 9; cols++) {
  for (let rows = 3; rows <= 11; rows++) {
    const aspect = W / cols / (H / rows);
    if (aspect < 0.88 || aspect > 1.14) continue; // cells must be roughly square
    results.push(score(cols, rows));
  }
}
results.sort((a, b) => a.err - b.err);
console.log('Best square-cell grids (lower err = cells sit cleanly at 0 / .5 / 1):');
for (const r of results.slice(0, 6)) console.log(' ', JSON.stringify(r));

const best = results[0];
const cw = W / best.cols;
const ch = H / best.rows;

console.log(`\nCoverage map ${best.cols}x${best.rows}:`);
for (let r = 0; r < best.rows; r++) {
  const row = [];
  for (let c = 0; c < best.cols; c++) row.push(coverage(c * cw, r * ch, cw, ch).toFixed(2));
  console.log('  ' + row.join(' '));
}

console.log('\nQuadrant coverage per cell (TL TR BL BR, 0-9):');
for (let r = 0; r < best.rows; r++) {
  const row = [];
  for (let c = 0; c < best.cols; c++) {
    const x = c * cw;
    const y = r * ch;
    const q = [
      coverage(x, y, cw / 2, ch / 2),
      coverage(x + cw / 2, y, cw / 2, ch / 2),
      coverage(x, y + ch / 2, cw / 2, ch / 2),
      coverage(x + cw / 2, y + ch / 2, cw / 2, ch / 2),
    ].map((v) => Math.round(v * 9));
    row.push(q.join(''));
  }
  console.log('  ' + row.join(' '));
}
