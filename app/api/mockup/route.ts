export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: Request) {
  const { refinedUrl, x=320, y=260, scale=1 } = await req.json();
  const skinUrl = new URL('/mockups/triceps_base.png', process.env.NEXT_PUBLIC_URL!).toString();
  const [tattooBuf, skinBuf] = await Promise.all([
    fetch(refinedUrl).then(r=>r.arrayBuffer()).then(b=>Buffer.from(b)),
    fetch(skinUrl).then(r=>r.arrayBuffer()).then(b=>Buffer.from(b))
  ]);
  const tattoo = await sharp(tattooBuf).resize({ width: Math.round(800*scale) }).png().toBuffer();
  const out = await sharp(skinBuf)
    .composite([{ input: tattoo, top: y, left: x, blend: 'multiply' }])
    .png().toBuffer();
  return new NextResponse(out as any, { headers: { 'Content-Type': 'image/png' }});
}
