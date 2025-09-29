import { FLAGS } from '@/lib/flags';

export type RefineInput = {
  initUrl: string;
  prompt: string;
  strength?: number; // 0..1 (0.35–0.45 suggested)
};

export type RefineResult = { ok: true; provider: string; url: string } | { ok:false; error:string };

async function leonardoRefine(x: RefineInput): Promise<RefineResult> {
  try {
    const r = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: x.prompt,
        init_image: x.initUrl,
        image_to_image_strength: x.strength ?? Number(process.env.STRENGTH_DEFAULT ?? 0.4),
        width: 1024, height: 1536
      })
    });
    const data = await r.json() as any;
    const url = data?.generations?.[0]?.generated_images?.[0]?.url;
    if (!url) return { ok:false, error:'Leonardo: no url' };
    return { ok:true, provider:'leonardo', url };
  } catch (e:any) {
    return { ok:false, error:`Leonardo err: ${e?.message||e}` };
  }
}

async function stabilityRefine(_x: RefineInput): Promise<RefineResult> {
  try {
    // TODO: implement multipart per Stability API spec
    return { ok:false, error:'Stability provider not yet implemented' };
  } catch (e:any) {
    return { ok:false, error:`Stability err: ${e?.message||e}` };
  }
}

export async function refineAuto(input: RefineInput): Promise<RefineResult> {
  const order = (process.env.IMAGE_PROVIDER_ORDER||'leonardo,stability').split(',');
  for (const p of order) {
    const res = p.trim()==='stability' ? await stabilityRefine(input) : await leonardoRefine(input);
    if (res.ok) return res;
    if (!FLAGS.PROVIDER_FAILOVER) break;
  }
  return { ok:false, error:'All providers failed' };
}
