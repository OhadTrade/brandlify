/**
 * Derives every brand asset the site needs from the owner's source artwork in
 * assets/source/. Re-run with `npm run brand` whenever the source art changes.
 *
 * The supplied lockups are rendered for a LIGHT background: the wordmark's
 * median colour is #280C66, which is 1.28:1 against --bg-base (#08060E) —
 * effectively invisible. This script therefore also emits "-ondark" variants
 * where the wordmark's luminance is remapped onto a light-violet metallic ramp
 * (median ~6.9:1) while the mark keeps its original magenta identity.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildFacets, facetColour } from '@/components/hero/markGeometry';

/**
 * Favicon, drawn rather than shrunk.
 *
 * Downscaling the glossy 3D render to 16px produced a smudge: the mark is 20
 * triangles with internal highlights, and at that size the detail turns to
 * noise. These are drawn from the same extracted facet geometry the 3D hero
 * uses, with the level of detail chosen per size:
 *
 *   <= 48px  one silhouette under a single gradient — no internal seams at all,
 *            because at 16px an internal line is just a dirty pixel
 *   >= 64px  individual facets with hairline separators, as in the logo
 */
function markSvg(size, { faceted }) {
  // Facets are centred on the origin, 3 units wide by 4 tall, Y up.
  // Negative gap on the solid version: adjacent polygons that merely touch
  // leave a hairline of anti-aliasing between them, which at 16px reads as a
  // crack through the glyph. Overlapping them slightly welds the silhouette.
  const facets = buildFacets({ gap: faceted ? 0.045 : -0.03 });
  // Small icons give the glyph more of the tile; large ones can afford air.
  const pad = faceted ? 0.3 : 0.14;
  const vb = `${-1.5 - pad} ${-2 - pad} ${3 + pad * 2} ${4 + pad * 2}`;
  const radius = size >= 64 ? size * 0.18 : 0;

  const shapes = facets
    .map((facet) => {
      const points = facet.points.map(([x, y]) => `${x.toFixed(3)},${(-y).toFixed(3)}`).join(' ');
      const fill = faceted ? rampColor(facet.ramp) : 'url(#markGradient)';
      const stroke = faceted ? ' stroke="#08060E" stroke-width="0.028" stroke-linejoin="round"' : '';
      return `<polygon points="${points}" fill="${fill}"${stroke}/>`;
    })
    .join('');

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
       <defs>
         <linearGradient id="markGradient" x1="0" y1="1" x2="1" y2="0">
           <stop offset="0%" stop-color="#6B24C8"/>
           <stop offset="55%" stop-color="#A93BEE"/>
           <stop offset="100%" stop-color="#E635F0"/>
         </linearGradient>
       </defs>
       <rect width="${size}" height="${size}" rx="${radius}" fill="#08060E"/>
       <svg x="0" y="0" width="${size}" height="${size}" viewBox="${vb}">${shapes}</svg>
     </svg>`,
  );
}

/** Lighten (amount > 0) or darken (amount < 0) a hex colour. */
function shade(hex, amount) {
  const channels = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
  return `#${channels
    .map((v) => {
      const next = amount >= 0 ? v + (255 - v) * amount : v * (1 + amount);
      return Math.round(Math.min(255, Math.max(0, next)))
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

/**
 * The hero fallback, drawn instead of upscaled.
 *
 * This is what every visitor below 1024px sees, plus anyone on reduced motion
 * or without WebGL — in other words, most people. It used to be mark.png blown
 * up 3.2x from a 318px source, which was visibly soft.
 *
 * Each facet gets its own light-to-dark gradient across the 45deg axis, which
 * is what reads as bevelled depth, plus a hairline separator. Transparent
 * background: the hero supplies its own glow.
 */
/** Wider than the icon ramp: at hero size the diagonal has room to travel. */
const HERO_STOPS = [
  [0, '#3E12A8'],
  [0.35, '#7526E0'],
  [0.7, '#B430E4'],
  [1, '#F04BF0'],
];

function heroRamp(t) {
  for (let i = 1; i < HERO_STOPS.length; i++) {
    const [t1, c1] = HERO_STOPS[i];
    if (t <= t1) {
      const [t0, c0] = HERO_STOPS[i - 1];
      const f = (t - t0) / (t1 - t0);
      const parse = (hex) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
      const a = parse(c0);
      const b = parse(c1);
      return `#${a.map((v, k) => Math.round(v + (b[k] - v) * f).toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return HERO_STOPS[HERO_STOPS.length - 1][1];
}

/** Pull a triangle's corners toward its centroid — the geometry's own inset. */
function insetTri(points, amount) {
  const cx = (points[0][0] + points[1][0] + points[2][0]) / 3;
  const cy = (points[0][1] + points[1][1] + points[2][1]) / 3;
  return points.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return [x - (dx / len) * amount, y - (dy / len) * amount];
  });
}

const toPts = (points) =>
  points.map(([x, y]) => `${x.toFixed(3)},${(-y).toFixed(3)}`).join(' ');

/**
 * The hero mark, as a still.
 *
 * This is what a phone shows, and what anyone with reduced motion turned on
 * shows, in place of the WebGL mark — so it has to be the same object, not a
 * flat diagram of it. Each facet is drawn the way the 3D one is built: an
 * extrusion body offset behind, a chamfered rim, and a face inset inside the
 * rim, all in the same measured colours the renderer uses.
 *
 * It used to be flat polygons on their own HERO_STOPS ramp with a dark outline.
 * That reads as a sticker; the version below reads as the logo.
 */
function heroMarkSvg(width) {
  const facets = buildFacets({ gap: 0.04 });
  const RIM = 0.075;
  const DEPTH_X = 0.05;
  const DEPTH_Y = 0.06;
  const pad = 0.14;
  const vbW = 3 + pad * 2;
  const vbH = 4 + pad * 2;
  const height = Math.round((width * vbH) / vbW);

  const defs = facets
    .map((facet, i) => {
      const c = facetColour(facet.key);
      return `<linearGradient id="f${i}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c.light}"/>
        <stop offset="45%" stop-color="${c.base}"/>
        <stop offset="100%" stop-color="${c.dark}"/>
      </linearGradient>
      <linearGradient id="r${i}" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="${c.light}"/>
        <stop offset="100%" stop-color="${c.base}"/>
      </linearGradient>`;
    })
    .join('');

  const shapes = facets
    .map((facet, i) => {
      const c = facetColour(facet.key);
      const body = toPts(facet.points.map(([x, y]) => [x + DEPTH_X, y - DEPTH_Y]));
      const outer = toPts(facet.points);
      const inner = toPts(insetTri(facet.points, RIM));
      return (
        `<polygon points="${body}" fill="${c.dark}"/>` +
        `<polygon points="${outer}" fill="url(#r${i})"/>` +
        `<polygon points="${inner}" fill="url(#f${i})"/>` +
        `<polygon points="${inner}" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.008"/>`
      );
    })
    .join('');

  return {
    svg: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${-1.5 - pad} ${-2 - pad} ${vbW} ${vbH}">
         <defs>${defs}</defs>${shapes}
       </svg>`,
    ),
    width,
    height,
  };
}

/** Flat ramp for the drawn icons — brighter than the tokens so it holds up small. */
const ICON_STOPS = [
  [0, '#5A1BB8'],
  [0.4, '#8A2EE8'],
  [0.7, '#C22ED8'],
  [1, '#E635F0'],
];

function rampColor(t) {
  for (let i = 1; i < ICON_STOPS.length; i++) {
    const [t1, c1] = ICON_STOPS[i];
    if (t <= t1) {
      const [t0, c0] = ICON_STOPS[i - 1];
      const f = (t - t0) / (t1 - t0);
      const parse = (hex) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
      const a = parse(c0);
      const b = parse(c1);
      return `#${a.map((v, k) => Math.round(v + (b[k] - v) * f).toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return ICON_STOPS[ICON_STOPS.length - 1][1];
}

const SRC = 'assets/source';
const BRAND = 'public/brand';
const PUB = 'public';

const BG = { r: 8, g: 6, b: 14, alpha: 1 }; // --bg-base #08060E

/** sRGB channel -> linear */
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const relLum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
/** CIE L* from relative luminance — perceptually even, good for tone mapping */
const lstar = (y) => (y <= 216 / 24389 ? y * (24389 / 27) : Math.cbrt(y) * 116 - 16);

/** Light-violet metallic ramp for wordmarks sitting on --bg-base */
const RAMP = [
  [0.0, [0x6a, 0x2b, 0xc4]],
  [0.3, [0x9b, 0x5c, 0xee]],
  [0.6, [0xc4, 0x95, 0xf7]],
  [0.85, [0xe9, 0xcc, 0xfb]],
  [1.0, [0xff, 0xff, 0xff]],
];

function rampAt(t) {
  for (let i = 1; i < RAMP.length; i++) {
    if (t <= RAMP[i][0]) {
      const [t0, c0] = RAMP[i - 1];
      const [t1, c1] = RAMP[i];
      const f = (t - t0) / (t1 - t0);
      return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * f));
    }
  }
  return RAMP[RAMP.length - 1][1];
}

/**
 * Remap the luminance of a horizontal or vertical slice of the image onto RAMP.
 * `slice` = { axis: 'x'|'y', from, to } in pixels; pixels outside are untouched.
 */
async function toneMapSlice(inputPath, slice) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const inSlice = (x, y) =>
    slice.axis === 'x' ? x >= slice.from && x < slice.to : y >= slice.from && y < slice.to;

  // Collect L* over opaque pixels in the slice to find the working range.
  const ls = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!inSlice(x, y)) continue;
      const i = (y * W + x) * C;
      if (data[i + 3] < 24) continue;
      ls.push(lstar(relLum(data[i], data[i + 1], data[i + 2])));
    }
  }
  ls.sort((a, b) => a - b);
  const lo = ls[Math.floor(ls.length * 0.02)];
  const hi = ls[Math.floor(ls.length * 0.98)];
  const span = Math.max(hi - lo, 1e-6);

  const out = Buffer.from(data);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!inSlice(x, y)) continue;
      const i = (y * W + x) * C;
      if (data[i + 3] < 4) continue;
      const t = Math.min(
        1,
        Math.max(0, (lstar(relLum(data[i], data[i + 1], data[i + 2])) - lo) / span),
      );
      const [r, g, b] = rampAt(t);
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
    }
  }
  return sharp(out, { raw: { width: W, height: H, channels: C } }).png();
}

/** Find where the mark ends and the wordmark begins: the widest transparent gap. */
async function findGap(inputPath, axis) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const n = axis === 'x' ? W : H;
  const other = axis === 'x' ? H : W;
  const empty = [];
  for (let a = 0; a < n; a++) {
    let maxA = 0;
    for (let b = 0; b < other; b++) {
      const x = axis === 'x' ? a : b;
      const y = axis === 'x' ? b : a;
      const alpha = data[(y * W + x) * C + 3];
      if (alpha > maxA) maxA = alpha;
    }
    empty.push(maxA < 12);
  }
  // Widest run of empty lines that does not touch either edge.
  let best = null;
  let start = null;
  for (let a = 0; a <= n; a++) {
    if (a < n && empty[a]) {
      if (start === null) start = a;
    } else if (start !== null) {
      const run = { start, end: a, len: a - start };
      if (start > 0 && a < n && (!best || run.len > best.len)) best = run;
      start = null;
    }
  }
  return best ? Math.round((best.start + best.end) / 2) : Math.round(n / 2);
}

/** Minimal PNG-payload .ico container (supported by every browser since IE11). */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach((p, i) => {
    const o = i * 16;
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, o);
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(p.buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += p.buf.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.buf)]);
}

/**
 * Lay the mark above the wordmark, both taken from the horizontal lockup so the
 * artwork is identical to the crisp source. `gap` is the x split found by
 * findGap(); mark is everything before it, wordmark everything after.
 */
async function composeStacked(sourcePath, gap, outPath) {
  const meta = await sharp(sourcePath).metadata();

  const mark = await sharp(sourcePath)
    .extract({ left: 0, top: 0, width: gap, height: meta.height })
    .trim({ threshold: 8 })
    .toBuffer();
  const word = await sharp(sourcePath)
    .extract({ left: gap, top: 0, width: meta.width - gap, height: meta.height })
    .trim({ threshold: 8 })
    .toBuffer();

  const markMeta = await sharp(mark).metadata();
  // Wordmark sits at 1.55x the mark's width — the proportion the horizontal
  // lockup already uses between the two elements.
  const wordWidth = Math.round(markMeta.width * 1.55);
  const wordResized = await sharp(word).resize({ width: wordWidth, kernel: 'lanczos3' }).toBuffer();
  const wordMeta = await sharp(wordResized).metadata();

  const gapY = Math.round(markMeta.height * 0.14);
  const width = Math.max(markMeta.width, wordMeta.width);
  const height = markMeta.height + gapY + wordMeta.height;

  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: mark, left: Math.round((width - markMeta.width) / 2), top: 0 },
      {
        input: wordResized,
        left: Math.round((width - wordMeta.width) / 2),
        top: markMeta.height + gapY,
      },
    ])
    .png()
    .toFile(outPath);
}

async function main() {
  await mkdir(BRAND, { recursive: true });

  // ---- 1. The owner's originals, untouched (for light surfaces) ----
  await sharp(join(SRC, 'lockup-horizontal-src.png'))
    .png()
    .toFile(join(BRAND, 'lockup-horizontal.png'));
  // Kept for reference only — see composeStacked() below for why it is not used.
  await sharp(join(SRC, 'lockup-stacked-src.png'))
    .trim({ threshold: 8 })
    .png()
    .toFile(join(BRAND, 'lockup-stacked-original.png'));

  // ---- 2. Mark ----
  const markTrimmed = await sharp(join(SRC, 'mark-512-src.png')).trim({ threshold: 8 }).toBuffer();
  const markMeta = await sharp(markTrimmed).metadata();
  await sharp(markTrimmed).png().toFile(join(BRAND, 'mark.png'));
  // Kept for reference: this is the 3.2x upscale the hero used to fall back to.
  await sharp(markTrimmed)
    .resize({ width: 1024, kernel: 'lanczos3' })
    .png()
    .toFile(join(BRAND, 'mark-1024w.png'));

  // The hero fallback, drawn from geometry so it is sharp at any size.
  const hero = heroMarkSvg(1200);
  await sharp(hero.svg, { density: 384 })
    .resize(hero.width, hero.height)
    .png()
    .toFile(join(BRAND, 'mark-hero.png'));

  // Monochrome white mark: keep the silhouette, drop the colour.
  const { data: md, info: mi } = await sharp(markTrimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const white = Buffer.from(md);
  for (let i = 0; i < white.length; i += mi.channels) {
    white[i] = 255;
    white[i + 1] = 255;
    white[i + 2] = 255;
  }
  await sharp(white, { raw: { width: mi.width, height: mi.height, channels: mi.channels } })
    .png()
    .toFile(join(BRAND, 'mark-white.png'));

  // ---- 3. Wordmark, cut out of the horizontal lockup ----
  const hSrc = join(SRC, 'lockup-horizontal-src.png');
  const hMeta = await sharp(hSrc).metadata();
  const hGap = await findGap(hSrc, 'x');
  await sharp(hSrc)
    .extract({ left: hGap, top: 0, width: hMeta.width - hGap, height: hMeta.height })
    .trim({ threshold: 8 })
    .png()
    .toFile(join(BRAND, 'wordmark.png'));

  // ---- 4. On-dark variants: wordmark tone-mapped, mark untouched ----
  await (await toneMapSlice(hSrc, { axis: 'x', from: hGap, to: hMeta.width })).toFile(
    join(BRAND, 'lockup-horizontal-ondark.png'),
  );

  await sharp(join(BRAND, 'lockup-horizontal-ondark.png'))
    .extract({ left: hGap, top: 0, width: hMeta.width - hGap, height: hMeta.height })
    .trim({ threshold: 8 })
    .png()
    .toFile(join(BRAND, 'wordmark-ondark.png'));

  // ---- 4b. Stacked lockup, recomposed ----
  // The supplied stacked render carries a much softer, partly melted extrusion
  // of the wordmark than the horizontal file does. Rather than ship the weaker
  // artwork, the stacked lockup is laid out from the SAME pieces as the crisp
  // horizontal file: identical letterforms and mark, only re-arranged.
  await composeStacked(hSrc, hGap, join(BRAND, 'lockup-stacked.png'));
  await composeStacked(
    join(BRAND, 'lockup-horizontal-ondark.png'),
    hGap,
    join(BRAND, 'lockup-stacked-ondark.png'),
  );

  // ---- 5. Favicons / app icons: mark on the brand's dark canvas ----
  const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];
  const iconBufs = {};
  for (const size of sizes) {
    // Rendered from vector geometry at each size, not resampled from one raster.
    const buf = await sharp(markSvg(size, { faceted: size >= 64 }), { density: 384 })
      .resize(size, size)
      .png()
      .toBuffer();
    iconBufs[size] = buf;
    await writeFile(join(PUB, `icon-${size}.png`), buf);
  }
  await writeFile(join(PUB, 'apple-touch-icon.png'), iconBufs[180]);

  // Maskable: the glyph must sit inside the centre 60% or a platform mask clips
  // it, so it is drawn small onto a full-bleed square with no corner radius.
  const maskGlyph = await sharp(markSvg(307, { faceted: true }), { density: 384 })
    .resize(307, 307)
    .png()
    .toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BG } })
    .composite([{ input: maskGlyph, gravity: 'center' }])
    .png()
    .toFile(join(PUB, 'icon-maskable-512.png'));

  await writeFile(
    join(PUB, 'favicon.ico'),
    buildIco([16, 32, 48].map((s) => ({ size: s, buf: iconBufs[s] }))),
  );

  // ---- 6. Default Open Graph card ----
  const glow = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <radialGradient id="g" cx="50%" cy="42%" r="55%">
           <stop offset="0%" stop-color="#832FF0" stop-opacity="0.45"/>
           <stop offset="55%" stop-color="#E635F0" stop-opacity="0.12"/>
           <stop offset="100%" stop-color="#08060E" stop-opacity="0"/>
         </radialGradient>
         <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" stop-color="#832FF0"/>
           <stop offset="100%" stop-color="#E635F0"/>
         </linearGradient>
       </defs>
       <rect width="1200" height="630" fill="#08060E"/>
       <rect width="1200" height="630" fill="url(#g)"/>
       <rect x="0" y="614" width="1200" height="16" fill="url(#bar)"/>
     </svg>`,
  );
  // The horizontal lockup is the highest-fidelity source we have — use it here
  // rather than the softer stacked render.
  const ogLogo = await sharp(join(BRAND, 'lockup-horizontal-ondark.png'))
    .trim({ threshold: 8 })
    .resize({ width: 680, kernel: 'lanczos3' })
    .toBuffer();
  await sharp(glow)
    .composite([{ input: ogLogo, gravity: 'center' }])
    .png()
    .toFile(join(BRAND, 'og-image-1200x630.png'));

  // ---- 7. Report ----
  const report = [];
  for (const f of [
    'lockup-horizontal.png',
    'lockup-horizontal-ondark.png',
    'lockup-stacked.png',
    'lockup-stacked-ondark.png',
    'lockup-stacked-original.png',
    'mark.png',
    'mark-1024w.png',
    'mark-white.png',
    'wordmark.png',
    'wordmark-ondark.png',
    'og-image-1200x630.png',
  ]) {
    const m = await sharp(join(BRAND, f)).metadata();
    report.push(`  brand/${f.padEnd(30)} ${m.width}x${m.height}`);
  }
  console.log('brand assets written:');
  console.log(report.join('\n'));
  console.log(`  icons: ${sizes.join(', ')} + apple-touch-icon + maskable-512 + favicon.ico`);
  console.log(
    `  mark source: ${markMeta.width}x${markMeta.height} (mark-1024w is an upscale of this)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
