import fs from 'fs';
import path from 'path';

const distIndexPath = path.resolve(process.cwd(), 'dist', 'index.html');
const fallbackIndexPath = path.resolve(process.cwd(), 'index.html');
const outputPath = path.resolve(process.cwd(), 'api', '_ssrTemplate.ts');

const sourcePath = fs.existsSync(distIndexPath) ? distIndexPath : fallbackIndexPath;
const html = fs.readFileSync(sourcePath, 'utf-8');

const tsContent = `// Auto-generated during build by scripts/prepare-ssr.mjs (prefixed with _ so Vercel does not deploy it as a function)\nexport const SSR_TEMPLATE_HTML: string = ${JSON.stringify(html)};\n`;

fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log(
  `[prepare-ssr] Captured SSR HTML template from ${path.relative(process.cwd(), sourcePath)} -> api/_ssrTemplate.ts (${html.length} bytes)`
);
