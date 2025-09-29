// app/api/assist/route.ts
// Gemini 1.5 Vision ile öneri üretir; JSON döner.
// ENV: GEMINI_API_KEY, GEMINI_MODEL (örn: gemini-1.5-flash)
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function guessMime(url: string): string {
  const u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.png')) return 'image/png';
  return 'image/png';
}
function stripCodeFences(t: string) {
  return t.replace(/```json\s*([\s\S]*?)```/i, '$1').trim();
}

export async function POST(req: Request) {
  try {
    const { imageUrl, context, mode = 'refine' } = await req.json();
    if (!process.env.GEMINI_API_KEY)
      return NextResponse.json({ ok:false, error:'Missing GEMINI_API_KEY' }, { status: 500 });
    if (!imageUrl)
      return NextResponse.json({ ok:false, error:'imageUrl required' }, { status: 400 });

    const mimeType = guessMime(imageUrl);
    const arr = await fetch(imageUrl).then(r => {
      if (!r.ok) throw new Error(`Image fetch failed: ${r.status}`);
      return r.arrayBuffer();
    });
    const b64 = Buffer.from(arr).toString('base64');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const modelId = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelId });

    const sys = `
You are a tattoo refinement assistant. Analyze the provided tattoo image and return JSON ONLY:
{
  "suggestions": [ "bullet-1", "bullet-2", "bullet-3" ],
  "prompt_append": "one compact phrase (<220 chars) to append to the user's prompt for a better next pass",
  "notes": "short cautions if any (max 2 lines)"
}
Focus on: removing noisy lines, soft pastel gold/orange gradients around sun, preserving linework clarity, light harmony, triceps-friendly vertical flow. Mode: ${mode}.
No extra prose outside JSON.
    `.trim();

    const resp = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: sys },
          { text: `User context/prompt: ${context || '(none)'}` },
          { inlineData: { mimeType, data: b64 } }
        ]
      }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
    });

    const text = resp.response.text();
    const jsonText = stripCodeFences(text);
    const parsed = JSON.parse(jsonText);
    return NextResponse.json({ ok: true, ...parsed });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || 'assist failed' }, { status: 500 });
  }
}
