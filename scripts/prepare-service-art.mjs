import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source) throw new Error('Provide the directory containing the generated PNG originals.');
const files = {
  websites: 'exec-a54de69d-610e-4c9b-bb5c-890ea54a96ed.png',
  branding: 'exec-3646ae1b-3c13-4381-b729-5728c38dd757.png',
  marketing: 'exec-42239593-6acb-4ea5-95bd-6979e2038233.png',
  seo: 'exec-cc86f4fd-1387-49de-a4b5-f3977ee54ce4.png',
  automations: 'exec-17785f8f-80ed-421d-ba72-12a3e5c8124b.png',
};
const output = new URL('../public/brand/services/', import.meta.url);
await mkdir(output, { recursive: true });
for (const [name, file] of Object.entries(files)) {
  const result = await sharp(path.join(source, file)).resize(800, 800).webp({ quality: 88 }).toFile(fileURLToPath(new URL(`${name}-v1.webp`, output)));
  console.log(`${name}: ${result.size} bytes`);
}
