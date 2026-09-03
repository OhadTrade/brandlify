/** Draws candidate grids over the mark so the real cell structure can be seen. */
import sharp from 'sharp';

const SRC = 'public/brand/mark.png';
const meta = await sharp(SRC).metadata();
const { width: W, height: H } = meta;

const grids = [
  [3, 4, '#00ff88'],
  [4, 5, '#ffcc00'],
  [6, 8, '#00ccff'],
];

const out = [];
for (const [cols, rows, color] of grids) {
  const lines = [];
  for (let c = 0; c <= cols; c++) {
    const x = (c * W) / cols;
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${color}" stroke-width="2"/>`);
  }
  for (let r = 0; r <= rows; r++) {
    const y = (r * H) / rows;
    lines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${color}" stroke-width="2"/>`);
  }
  // both diagonals per cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c * W) / cols;
      const y = (r * H) / rows;
      const w = W / cols;
      const h = H / rows;
      lines.push(
        `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${color}" stroke-width="1" opacity="0.5"/>`,
        `<line x1="${x + w}" y1="${y}" x2="${x}" y2="${y + h}" stroke="${color}" stroke-width="1" opacity="0.5"/>`,
      );
    }
  }
  const svg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${lines.join('')}</svg>`,
  );
  const buf = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 8, g: 6, b: 14, alpha: 1 } },
  })
    .composite([{ input: await sharp(SRC).toBuffer() }, { input: svg }])
    .png()
    .toBuffer();
  out.push(buf);
}

const gap = 24;
await sharp({
  create: {
    width: W * out.length + gap * (out.length - 1),
    height: H,
    channels: 4,
    background: { r: 8, g: 6, b: 14, alpha: 1 },
  },
})
  .composite(out.map((input, i) => ({ input, left: i * (W + gap), top: 0 })))
  .png()
  .toFile('assets/grid-overlay.png');

console.log('assets/grid-overlay.png written — 3x4 (green), 4x5 (yellow), 6x8 (blue)');
