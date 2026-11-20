// Vercel Serverless Function: GET /robots.txt
import { generateRobotsTxt } from '../src/server/ssrEngine';

export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  res.status(200).send(generateRobotsTxt());
}
