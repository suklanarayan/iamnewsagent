import fs from 'fs';
import path from 'path';
import { build } from 'esbuild';

const rootDir = process.cwd();
const distIndexPath = path.resolve(rootDir, 'dist', 'index.html');
const fallbackIndexPath = path.resolve(rootDir, 'index.html');
const outputBundlePath = path.resolve(rootDir, 'api', '_ssrBundle.mjs');

const sourcePath = fs.existsSync(distIndexPath) ? distIndexPath : fallbackIndexPath;
const html = fs.readFileSync(sourcePath, 'utf-8');

await build({
  entryPoints: [path.resolve(rootDir, 'src', 'server', 'vercelEntry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: outputBundlePath,
  minify: false,
  define: {
    __SSR_TEMPLATE_HTML__: JSON.stringify(html),
  },
  banner: {
    js: '// Auto-generated self-contained Node ESM bundle for Vercel /api/ssr and /api/seo (prefixed with _ so Vercel does not deploy it as a standalone route)\n',
  },
});

const stats = fs.statSync(outputBundlePath);
console.log(
  `[prepare-ssr] Bundled api/_ssrBundle.mjs (${Math.round(stats.size / 1024)} KB) with SSR HTML template from ${path.relative(rootDir, sourcePath)} (${html.length} bytes)`
);
