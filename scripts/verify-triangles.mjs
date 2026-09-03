/** Renders the extracted triangle map beside the artwork so the two can be compared. */
import sharp from 'sharp';

const SRC = 'public/brand/mark.png';
const CELLS = [
  ['UR', 'FULL', 'LL'],
  ['FULL', 'FULL', 'UL'],
  ['FULL', 'FULL', 'LL'],
  ['UL', 'FULL', 'UL'],
];

const { width: W, height: H } = await sharp(SRC).metadata();
const COLS = CELLS[0].length;
const ROWS = CELLS.length;
const cw = W / COLS;
const ch = H / ROWS;

/** Corner points of each triangle in cell-local units. */
const POINTS = {
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

const polys = [];
CELLS.forEach((row, r) =>
  row.forEach((cell, c) => {
    if (cell === '.') return;
    const kinds = cell === 'FULL' ? ['UR', 'LL'] : [cell];
    kinds.forEach((kind, i) => {
      const pts = POINTS[kind]
        .map(([u, v]) => `${(c + u) * cw},${(r + v) * ch}`)
        .join(' ');
      polys.push(
        `<polygon points="${pts}" fill="${i === 0 ? '#832FF0' : '#E635F0'}" stroke="#08060E" stroke-width="2"/>`,
      );
    });
  }),
);

const svg = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${polys.join('')}</svg>`,
);

const rebuilt = await sharp(svg).png().toBuffer();
const original = await sharp({
  create: { width: W, height: H, channels: 4, background: { r: 8, g: 6, b: 14, alpha: 1 } },
})
  .composite([{ input: await sharp(SRC).toBuffer() }])
  .png()
  .toBuffer();

await sharp({
  create: { width: W * 2 + 24, height: H, channels: 4, background: { r: 8, g: 6, b: 14, alpha: 1 } },
})
  .composite([
    { input: original, left: 0, top: 0 },
    { input: rebuilt, left: W + 24, top: 0 },
  ])
  .png()
  .toFile('assets/triangle-check.png');

console.log('assets/triangle-check.png — artwork left, extracted geometry right');
