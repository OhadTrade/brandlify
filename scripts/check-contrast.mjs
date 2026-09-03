/**
 * Verifies every text/background pairing the design system actually uses
 * against WCAG 2.1 AA (IS 5568): 4.5:1 for body text, 3:1 for large text and
 * for non-text UI boundaries. Colours are parsed out of globals.css so the
 * check can never drift from the tokens.
 *
 * Run: npm run contrast   (exits non-zero on a failure)
 */
import { readFileSync } from 'node:fs';

const css = readFileSync('src/app/globals.css', 'utf8');

function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} not found in globals.css`);
  return m[1];
}

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lum = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const C = {
  base: token('color-base'),
  surface: token('color-surface'),
  elevated: token('color-elevated'),
  fg: token('color-fg'),
  muted: token('color-muted'),
  violet: token('color-violet'),
  magenta: token('color-magenta'),
  magentaDeep: token('color-magenta-deep'),
  pink: token('color-pink'),
  white: '#ffffff',
  // Endpoints of --gradient-cta, the only gradient that carries white text.
  ctaFrom: '#6b1fd4',
  ctaTo: '#c90cad',
};

/** [label, foreground, background, minimum] */
const CHECKS = [
  ['גוף טקסט ראשי על הבסיס', C.fg, C.base, 4.5],
  ['גוף טקסט ראשי על משטח', C.fg, C.surface, 4.5],
  ['טקסט משני על הבסיס', C.muted, C.base, 4.5],
  ['טקסט משני על משטח', C.muted, C.surface, 4.5],
  ['טקסט משני על משטח צף', C.muted, C.elevated, 4.5],
  ['מג׳נטה כטקסט על הבסיס', C.magenta, C.base, 4.5],
  ['ורוד כטקסט על הבסיס', C.pink, C.base, 4.5],
  ['לבן על תחילת גרדיאנט ה-CTA', C.white, C.ctaFrom, 4.5],
  ['לבן על סוף גרדיאנט ה-CTA', C.white, C.ctaTo, 4.5],
  ['סגול כמשטח/גבול (לא טקסט קטן)', C.violet, C.base, 3.0],
  ['טבעת פוקוס מג׳נטה על הבסיס', C.magenta, C.base, 3.0],
  ['טבעת פוקוס מג׳נטה על משטח', C.magenta, C.surface, 3.0],
];

let failed = 0;
const rows = CHECKS.map(([label, fg, bg, min]) => {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  return `${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${label}`;
});

console.log(rows.join('\n'));

// Violet is deliberately below 4.5 — assert that so nobody "fixes" it into
// small body text by accident.
const violetOnBase = ratio(C.violet, C.base);
if (violetOnBase >= 4.5) {
  console.log(
    `\nNOTE: --color-violet now reaches ${violetOnBase.toFixed(2)}:1 on the base; it may be used for small text.`,
  );
} else {
  console.log(
    `\nRULE: --color-violet is ${violetOnBase.toFixed(2)}:1 on the base — surfaces, borders and large text only. Use --color-magenta or --color-pink for small accent text.`,
  );
}

if (failed) {
  console.error(`\n${failed} contrast pairing(s) below AA.`);
  process.exit(1);
}
console.log('\nAll pairings pass WCAG 2.1 AA.');
