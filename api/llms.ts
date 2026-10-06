// Vercel Serverless Function: GET /llms.txt and /llms-full.txt
import { SEED_ARTICLES } from '../src/data/seedData';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  let doc = `# iamquickagent.com\n\n`;
  doc += `> Rapid digital news and intelligence publishing platform delivering real-time geopolitical, tech, semiconductor, cyber, and macroeconomic briefings with structured executive key takeaways.\n\n`;
  doc += `## Core Identity & Verification\n`;
  doc += `- Website: https://iamquickagent.com\n`;
  doc += `- Editorial Standards: Objective, non-partisan intelligence reporting verified across global wires.\n`;
  doc += `- Publisher: iamquickagent.com Intelligence Group\n`;
  doc += `- Google Site Verification: YFePTkFdMD9NtIIhg0fvDinPB8VPmTbH3Ahozp_tIqU\n\n`;
  doc += `## Coverage Domains\n`;
  doc += `- India & South Asia: Macroeconomics, digital public infrastructure, industrial policy.\n`;
  doc += `- World & Geopolitics: Multilateral summits (BRICS, G20), security treaties, sovereign trade.\n`;
  doc += `- Technology & AI: Advanced silicon fabrication, frontier AI models, quantum research.\n`;
  doc += `- Markets & Commodities: Capital inflows, energy transition, equity benchmarks.\n\n`;
  doc += `## Latest Published Dispatches\n\n`;

  for (const article of SEED_ARTICLES) {
    doc += `### [${article.headline}](https://iamquickagent.com/article/${article.slug})\n`;
    doc += `- Category: ${article.category}\n`;
    doc += `- Published: ${article.publishedAt}\n`;
    if (article.deck) doc += `- Executive Summary: ${article.deck}\n`;
    if (article.keyTakeaways && article.keyTakeaways.length > 0) {
      doc += `- Key Intelligence Points:\n`;
      article.keyTakeaways.forEach(pt => {
        doc += `  * ${pt}\n`;
      });
    }
    doc += `\n`;
  }

  res.status(200).send(doc);
}
