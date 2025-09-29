export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { basePrompt } from '@/lib/ai/presets';
import { refineAuto } from '@/lib/ai/providers';
import { pixelHeuristics, semanticGateByVision } from '@/lib/ai/qualityGate';
import { refineRatelimit, getIp } from '@/lib/security/rateLimit';
import { checkCredits, deductCredits, CREDIT_COST } from '@/lib/billing/credit';

export async function POST(req: Request) {
  // Rate limiting
  const ip = getIp(req);
  const { success } = await refineRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { initUrl, userPrompt, presets = [], strength, userId = 'guest' } = await req.json();
  
  // Credit check
  const creditCheck = await checkCredits(userId, CREDIT_COST.refine2K);
  if (!creditCheck.ok) {
    return NextResponse.json({ ok: false, error: creditCheck.error || 'Insufficient credits' }, { status: 402 });
  }

  const prompt = basePrompt(userPrompt||'', presets);
  const res = await refineAuto({ initUrl, prompt, strength });
  if (!res.ok) return NextResponse.json({ ok:false, error:res.error }, { status: 500 });

  try {
    const buf = Buffer.from(await (await fetch(res.url)).arrayBuffer());
    const p = await pixelHeuristics(buf);
    const s = await semanticGateByVision(res.url);
    if (!p.pass || !s.pass) {
      return NextResponse.json({ ok:false, error:'QualityGate failed', details:{p,s} }, { status: 422 });
    }
  } catch {}

  // Deduct credits on success
  await deductCredits(userId, CREDIT_COST.refine2K);

  return NextResponse.json({ ok:true, url:res.url, provider:res.provider });
}
