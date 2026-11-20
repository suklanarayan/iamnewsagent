import fs from 'fs';
import path from 'path';

const distIndexPath = path.resolve(process.cwd(), 'dist', 'index.html');
const fallbackIndexPath = path.resolve(process.cwd(), 'index.html');
const outputPath = path.resolve(process.cwd(), 'api', '_ssr-template.json');

const sourcePath = fs.existsSync(distIndexPath) ? distIndexPath : fallbackIndexPath;
const html = fs.readFileSync(sourcePath, 'utf-8');

fs.writeFileSync(outputPath, JSON.stringify({ html }, null, 2) + '\n', 'utf-8');
console.log(`[prepare-ssr] Captured SSR HTML template from ${path.relative(process.cwd(), sourcePath)} -> api/_ssr-template.json (${html.length} bytes)`);
