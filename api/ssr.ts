// Vercel Serverless Function: Dynamic SSR for /, /news/:slug, /author/:id, and legal pages
// Imports pre-bundled self-contained ESM module (explicit .mjs extension required by Node ESM on Vercel)
import { handleSsrRequest } from './_ssrBundle.mjs';

export default async function handler(req: any, res: any) {
  return handleSsrRequest(req, res);
}
