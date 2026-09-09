import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/components/motion/SmoothScroll.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;

async function setup({ motion = true, failImport = false, cancelEarly = false } = {}) {
  const effects = [], frames = new Map(), listeners = new Map(), ticker = new Set();
  const stats = { created: 0, destroyed: 0, refreshed: 0 };
  let serial = 0, mediaSetup, mediaCleanup;
  class Details { closest() { return true; } }
  const engine = {
    gsap: {
      matchMedia: () => ({
        add: (_query, callback) => { mediaSetup = callback; if (motion) mediaCleanup = callback(); },
        revert: () => { mediaCleanup?.(); mediaCleanup = undefined; mediaSetup = undefined; },
      }),
      ticker: { add: fn => ticker.add(fn), remove: fn => ticker.delete(fn), lagSmoothing() {} },
    },
    ScrollTrigger: { refresh: () => stats.refreshed++, update() {} },
  };
  class Lenis {
    constructor() { stats.created++; }
    on() {}
    raf() {}
    destroy() { stats.destroyed++; }
  }
  const exports = {};
  const context = {
    exports, Math, HTMLDetailsElement: Details,
    document: {
      addEventListener: (name, fn, capture) => { assert.equal(capture, true); listeners.set(name, fn); },
      removeEventListener: (name, fn) => { if (listeners.get(name) === fn) listeners.delete(name); },
    },
    requestAnimationFrame: fn => { frames.set(++serial, fn); return serial; },
    cancelAnimationFrame: id => frames.delete(id),
    require: name => {
      if (name === 'react') return { useEffect: fn => effects.push(fn) };
      if (name === 'next/navigation') return { usePathname: () => '/' };
      if (name.endsWith('constants')) return { MQ: { motionOk: 'motion-ok' } };
      if (failImport) throw new Error('Optional chunk unavailable');
      if (name === 'lenis') return { default: Lenis };
      if (name.endsWith('engine')) return engine;
      throw new Error(`Unexpected import: ${name}`);
    },
  };
  vm.runInNewContext(code, context);
  exports.SmoothScroll();
  const cleanup = effects.map(fn => fn());
  const dispose = () => cleanup.forEach(fn => fn?.());
  if (cancelEarly) dispose();
  await new Promise(resolve => setImmediate(resolve));
  return {
    stats, ticker, listeners, frames, dispose,
    flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); },
    toggle: (isDetails = true) => listeners.get('toggle')?.({ target: isDetails ? new Details() : {} }),
    setMotion: enabled => { mediaCleanup?.(); mediaCleanup = undefined; if (enabled) mediaCleanup = mediaSetup?.(); },
  };
}

test('motion preference can enable, disable and re-enable without duplicate tickers', async () => {
  const app = await setup({ motion: false });
  assert.equal(app.stats.created, 0);
  app.setMotion(true);
  assert.equal(app.ticker.size, 1);
  app.setMotion(false);
  assert.equal(app.ticker.size, 0);
  assert.equal(app.stats.destroyed, 1);
  app.setMotion(true);
  assert.equal(app.ticker.size, 1);
  app.dispose();
  assert.equal(app.ticker.size, 0);
  assert.equal(app.stats.created, app.stats.destroyed);
});

test('details changes coalesce refreshes and cleanup cancels pending work', async () => {
  const app = await setup();
  app.flush();
  assert.equal(app.stats.refreshed, 1);
  app.toggle(false);
  assert.equal(app.frames.size, 0);
  app.toggle(); app.toggle();
  assert.equal(app.frames.size, 1);
  app.flush();
  assert.equal(app.stats.refreshed, 2);
  app.toggle(); app.dispose(); app.flush();
  assert.equal(app.stats.refreshed, 2);
  assert.equal(app.listeners.size, 0);
});

test('unmount during async imports does not install any resources', async () => {
  const app = await setup({ cancelEarly: true });
  assert.equal(app.stats.created, 0);
  assert.equal(app.listeners.size, 0);
  assert.equal(app.frames.size, 0);
});

test('failed optional chunks leave no listeners or unhandled rejection', async () => {
  const app = await setup({ failImport: true });
  assert.equal(app.stats.created, 0);
  assert.equal(app.listeners.size, 0);
  app.dispose();
});
