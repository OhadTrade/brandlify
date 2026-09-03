/**
 * Lets the check scripts import application modules exactly as the app writes
 * them — `@/lib/…`, extensionless — under plain Node.
 *
 * Node resolves neither the `@/` path alias (that is tsconfig's, and only the
 * bundler reads it) nor extensionless TypeScript specifiers. Rather than bend
 * the application code to suit a script, or add a TypeScript runner as a
 * dependency, the script teaches Node the two rules it is missing.
 *
 * Used via `node --import ./scripts/ts-alias-hook.mjs <script>`.
 */
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve as resolvePath } from 'node:path';

const SRC = new URL('../src/', import.meta.url);

/** Try the extensionless specifier as .ts, .tsx, then an index file. */
function withExtension(fileUrl) {
  const base = fileURLToPath(fileUrl);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const url = withExtension(new URL(specifier.slice(2), SRC));
      if (url) return { url, shortCircuit: true };
    }

    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const parentDir = dirname(fileURLToPath(context.parentURL));
      const url = withExtension(pathToFileURL(resolvePath(parentDir, specifier)));
      if (url) return { url, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
});
