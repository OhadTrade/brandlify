import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

// Use an existing Playwright installation; no production dependency is needed.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.HERO_PLAYWRIGHT || 'playwright');
const base = process.env.HERO_TEST_URL || 'http://localhost:3010';
const output = process.env.HERO_TEST_OUTPUT || '.next/hero-check';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const errors = [];

async function scenario(name, options = {}, setup) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__heroVitals = { lcp: 0, cls: 0 };
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) window.__heroVitals.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__heroVitals.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  page.on('pageerror', error => errors.push({ name, message: error.message }));
  page.on('console', message => { if (message.type() === 'error') errors.push({ name, message: message.text() }); });
  if (setup) await setup(page);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('[data-hero-depth] img').evaluate(img => img.decode());
  return { context, page };
}

try {
  const { context, page } = await scenario('desktop');
  const canvas = page.locator('[data-hero-canvas]');
  await page.waitForFunction(() => document.querySelector('[data-hero-canvas]')?.dataset.renderState === 'idle');
  const initial = Number(await canvas.getAttribute('data-frames'));
  await page.waitForTimeout(300);
  assert.equal(Number(await canvas.getAttribute('data-frames')), initial, 'Rendering must stop at rest');
  await page.screenshot({ path: `${output}/desktop.png` });
  const desktopVitals = await page.evaluate(() => window.__heroVitals);
  assert(desktopVitals.cls < 0.1, 'Desktop layout must remain stable');
  const primary = page.locator('[aria-labelledby="home-title"] a[href="/contact"]');
  await primary.hover();
  await primary.focus();
  assert.equal(await primary.evaluate(el => getComputedStyle(el).outlineStyle), 'solid', 'Keyboard focus must be visible');
  await page.mouse.down();
  await page.screenshot({ path: `${output}/cta-active.png` });
  await page.mouse.move(1200, 80);
  await page.mouse.up();
  await page.mouse.move(1180, 300);
  await page.waitForTimeout(250);
  assert(Number(await canvas.getAttribute('data-frames')) > initial, 'Pointer must wake rendering');
  await page.locator('a[href="#services"]').first().click();
  await page.waitForFunction(() => document.querySelector('[data-hero-canvas]')?.dataset.renderState === 'paused');
  const paused = Number(await canvas.getAttribute('data-frames'));
  await page.waitForTimeout(350);
  assert.equal(Number(await canvas.getAttribute('data-frames')), paused, 'Offscreen rendering must stay stopped');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('[data-hero-canvas]')?.dataset.renderState === 'idle');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('[data-hero-canvas]'));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-hero-depth] img')).opacity === '1');
  assert.equal(await page.locator('[data-hero-depth] img').evaluate(img => getComputedStyle(img).opacity), '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('[data-hero-depth]')?.dataset.materialReady === 'true');
  await canvas.evaluate(c => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForFunction(() => !document.querySelector('[data-hero-canvas]'));
  await page.waitForTimeout(350);
  assert.equal(await page.locator('[data-hero-depth] img').evaluate(img => getComputedStyle(img).opacity), '1');
  await page.locator('[aria-labelledby="home-title"] a[href="/portfolio"]').click();
  await page.waitForURL('**/portfolio');
  assert.equal(await page.locator('[data-hero-canvas]').count(), 0);
  await page.goBack({ waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  // After forced GPU loss, browsers may retain a fallback page in back/forward cache.
  // The acceptance condition is usable content, not forcing a lost device to restart.
  await page.locator('#home-title').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const host = document.querySelector('[data-hero-depth]');
    const img = host?.querySelector('img');
    return host?.dataset.materialReady === 'true' || (img?.complete && img.naturalWidth > 0 && getComputedStyle(img).opacity === '1');
  });
  await page.locator('[aria-labelledby="home-title"] a[href="/contact"]').click();
  await page.waitForURL('**/contact');
  results.push({ name: 'desktop', idle: true, pointer: true, offscreen: true, reentry: true, liveReducedMotion: true, contextLoss: true, ctaNavigation: true, vitals: desktopVitals });
  await context.close();

  for (const [name, options, setup] of [
    ['mobile-390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
    ['mobile-375', { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }],
    ['reduced-motion', { reducedMotion: 'reduce' }],
    ['no-webgl', {}, page => page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args); };
    })],
    ['low-memory', {}, page => page.addInitScript(() => Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 }))],
    ['no-javascript', { javaScriptEnabled: false }],
  ]) {
    const { context, page } = await scenario(name, options, setup);
    await page.waitForTimeout(400);
    assert.equal(await page.locator('[data-hero-canvas]').count(), 0, `${name}: no WebGL canvas`);
    assert(await page.locator('#home-title').isVisible(), `${name}: HTML heading`);
    const check = await page.evaluate(() => {
      const img = document.querySelector('[data-hero-depth] img');
      return { overflow: document.documentElement.scrollWidth > innerWidth, imageLoaded: img.complete && img.naturalWidth > 0, opacity: getComputedStyle(img).opacity };
    });
    assert(!check.overflow && check.imageLoaded && check.opacity === '1', `${name}: visible fallback without overflow`);
    await page.screenshot({ path: `${output}/${name}.png` });
    if (name.startsWith('mobile')) {
      const layout = await page.evaluate(() => {
        const hero = document.querySelector('[aria-labelledby="home-title"]');
        const cta = hero.querySelector('a[href="/contact"]').getBoundingClientRect();
        const art = hero.querySelector('[data-hero-depth]').getBoundingClientRect();
        return { ctaWidth: cta.width, artTop: art.top, ctaBottom: cta.bottom, viewport: innerWidth };
      });
      assert(layout.ctaWidth >= layout.viewport * 0.85, 'Mobile primary CTA is full width');
      assert(layout.artTop > layout.ctaBottom, 'Mobile art follows the CTA');
    }
    const vitals = await page.evaluate(() => window.__heroVitals || null);
    if (vitals) assert(vitals.cls < 0.1, `${name}: stable layout`);
    results.push({ name, ...check, vitals });
    await context.close();
  }
  assert.deepEqual(errors, [], 'No browser errors');
  console.log(JSON.stringify({ results, errors }, null, 2));
  await writeFile(`${output}/results.json`, JSON.stringify({ results, errors }, null, 2));
} catch (error) {
  for (const context of browser.contexts()) for (const page of context.pages()) {
    console.error('Failure state', page.url(), await page.locator('h1').allTextContents(), await page.locator('[data-hero-depth]').count());
    await page.screenshot({ path: `${output}/failure.png` });
  }
  throw error;
} finally { await browser.close(); }
