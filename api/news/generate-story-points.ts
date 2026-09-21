// Vercel Serverless Function: POST /api/news/generate-story-points
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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, category, context } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: 'Story title is required.' });
  }

  try {
    const ai = getGenAI();
    const prompt = `You are an expert real-time news desk editor.
Generate live update points for a short-form Live Story card titled "${title}" in category "${category || 'General'}".
${context ? `Context/Notes: "${context}"` : ''}

Generate:
1. "subtitle": A very short 1-2 word location or status (e.g. "Live", "New Delhi", "Launch", "Markets", "Finals", "Breaking").
2. "keyPoints": Exactly 3 to 4 crisp, authoritative, one-sentence live updates or key developments.
3. "imageTopic": A 1-2 word visual search topic for an unsplash image (e.g. "rocket", "summit", "cricket", "ai", "finance").

Return ONLY valid JSON matching this schema:
{
  "subtitle": string,
  "keyPoints": string[],
  "imageTopic": string
}`;

    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let outputText = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        outputText = response.text || '{}';
        if (outputText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} error, trying fallback...`, (err as Error)?.message);
      }
    }

    if (!outputText && lastError) throw lastError;

    const parsed = JSON.parse(outputText || '{}');
    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    console.error('Error generating live story points:', err);
    return res.status(500).json({
      success: false,
      error: (err as Error).message || 'Failed generating live story points',
    });
  }
}
