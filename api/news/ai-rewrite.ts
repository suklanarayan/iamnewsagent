// Vercel Serverless Function: POST /api/news/ai-rewrite
import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const {
    rawText,
    headline,
    sourceName,
    preferredCategory,
    tone = 'journalistic and balanced',
  } = req.body || {};

  if (!rawText && !headline) {
    return res.status(400).json({ error: 'Either rawText or headline is required.' });
  }

  try {
    const ai = getGenAI();

    const prompt = `You are a Senior Editor at "iamnewsagent.com" (tagline: "Real News. Broader Perspectives.").
Your task is to take this raw news wire story and rewrite it into a completely original, authoritative, balanced, and copyright-clean investigative news report.

Source Information:
- Source Wire / Agency: ${sourceName || 'International News Wire'}
- Original Headline Hint: ${headline || 'N/A'}
- Preferred Category Hint: ${preferredCategory || 'Auto-detect'}
- Editorial Tone: ${tone}

Raw Source Content:
"""
${(rawText || headline).substring(0, 7000)}
"""

REQUIREMENTS FOR YOUR REWRITE:
1. "headline": An impactful, clear, journalistic headline (60-90 characters). Never clickbait.
2. "deck": A powerful 1-2 sentence executive subheadline summarizing why this matters right now.
3. "category": Must be one of these exact values: "India", "World", "Business", "Technology", "Markets", "Science", "Health", "Sports", "Lifestyle", "Entertainment", "Explainers", "Opinion".
4. "keyTakeaways": An array of 3 to 4 crisp, high-impact bullet points (each 15-25 words) detailing core findings, data figures, and strategic implications. Optimized for AI answer engines (AEO/GEO).
5. "content": A comprehensive, well-structured news story formatted in clean Markdown (500 - 800 words):
   - Include 2-3 informative ## Subheadings.
   - Begin with a strong lede answering who, what, when, where, and why.
   - Include context, historical background, global or domestic economic impact, and diverse stakeholder perspectives.
   - Maintain objective, neutral, professional journalistic ethics.
   - Formatted with paragraphs and occasional quotes or key points.
6. "tags": An array of 4-6 specific search and SEO tags (e.g., ["Artificial Intelligence", "Regulatory Policy", "Global Trade"]).
7. "readTimeMinutes": Estimated reading time as an integer (e.g., 3, 4, or 5).
8. "imageTopic": A 2-4 word visual query for a stock cover photo (e.g., "satellite earth orbit", "financial trading floor", "solar farm field", "semiconductor cleanroom").
9. "imageCaption": A professional journalistic photo caption crediting the conceptual context.

Return ONLY a valid JSON object with these keys:
{
  "headline": string,
  "deck": string,
  "category": string,
  "keyTakeaways": string[],
  "content": string,
  "tags": string[],
  "readTimeMinutes": number,
  "imageTopic": string,
  "imageCaption": string
}`;

    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let outputText = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        outputText = response.text || '{}';
        if (outputText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} attempt error, trying fallback...`, (err as Error)?.message);
      }
    }

    if (!outputText && lastError) {
      throw lastError;
    }

    const parsed = JSON.parse(outputText || '{}');

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    console.error('Gemini rewrite error:', err);
    return res.status(500).json({
      success: false,
      error: (err as Error).message || 'Failed to rewrite news with AI.',
    });
  }
}
