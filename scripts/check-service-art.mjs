import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.HERO_PLAYWRIGHT || 'playwright');
const base = process.env.HERO_TEST_URL || 'http://localhost:3010';
const output = process.env.HERO_TEST_OUTPUT || '.next/hero-check';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
const results = [];
try {
  for (const [name, options] of [
    ['desktop', { viewport: { width: 1440, height: 900 } }],
    ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
    ['reduced', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }],
  ]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    const cards = await page.locator('[data-service-card]').evaluateAll(elements => elements.map(card => {
      const img = card.querySelector('img');
      return { href: card.getAttribute('href'), source: new URL(img.currentSrc || img.src).searchParams.get('url') };
    }));
    assert.equal(cards.length, 5);
    for (const card of cards) {
      // Follow the real card, not a fabricated route or a mocked service.
      await page.locator(`[data-service-card][href="${card.href}"]`).click();
      await page.waitForURL(`${base}${card.href}`);
      const art = page.locator('[data-kind]');
      const img = art.locator('img[data-service-art]');
      await img.evaluate(image => image.decode());
      const source = await img.evaluate(image => new URL(image.currentSrc || image.src).searchParams.get('url'));
      assert.equal(source, card.source, `${name}: card and destination share artwork`);
      assert.equal(await art.locator('i').count(), 0, 'Old placeholder shapes are gone');
      assert(await page.locator('h1').isVisible());
      await page.waitForFunction(() => {
        const title = document.querySelector('h1');
        return title && [...title.querySelectorAll('*')].every(part => {
          const style = getComputedStyle(part);
          return Number(style.opacity) >= 0.99 && style.transform === 'none';
        });
      });
      assert(await page.locator('a[href^="/contact?service="]').isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: no overflow`);
      if (name !== 'mobile') {
        await art.hover({ position: { x: 40, y: 40 } });
        await page.waitForTimeout(550);
        const transformed = await img.evaluate(image => getComputedStyle(image).transform);
        if (name === 'desktop') assert.notEqual(transformed, 'none', 'Desktop illustration responds to pointer');
        else assert.equal(transformed, 'none', 'Reduced motion stays static');
      }
      const slug = card.href.split('/').pop();
      if (name !== 'reduced') await page.screenshot({ path: `${output}/service-${slug}-${name}.png` });
      results.push({ viewport: name, slug, source, matched: true });
      await page.goto(base, { waitUntil: 'networkidle' });
    }
    await page.goto(`${base}/services`, { waitUntil: 'networkidle' });
    for (const card of cards) {
      const slug = card.href.split('/').pop();
      const img = page.locator(`[data-kind="${slug}"] img`);
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(image => image.decode());
      assert.equal(await img.evaluate(image => new URL(image.currentSrc || image.src).searchParams.get('url')), card.source);
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, errors }, null, 2));
  await writeFile(`${output}/services-results.json`, JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
