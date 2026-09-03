/**
 * The full quality gate: types, lint, contrast, production build.
 *
 * Builds into .next-verify so it can run while `next dev` is up — sharing .next
 * between a dev server and a production build corrupts both.
 */
import { spawnSync } from 'node:child_process';

const steps = [
  ['types', 'npx', ['tsc', '--noEmit']],
  ['lint', 'npx', ['eslint', '.']],
  ['contrast', 'node', ['scripts/check-contrast.mjs']],
  ['lead-schema', 'node', ['--import', './scripts/ts-alias-hook.mjs', 'scripts/check-schema.mjs']],
  ['build', 'npx', ['next', 'build']],
];

let failed = null;
for (const [name, cmd, args] of steps) {
  console.log(`\n─── ${name} ${'─'.repeat(Math.max(0, 60 - name.length))}`);
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, NEXT_DIST_DIR: '.next-verify' },
  });
  if (res.status !== 0) {
    failed = name;
    break;
  }
}

if (failed) {
  console.error(`\n✗ ${failed} failed.`);
  process.exit(1);
}
console.log('\n✓ types · lint · contrast · build all clean.');
