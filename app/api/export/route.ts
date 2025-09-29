export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { trace } from 'potrace';

async function createPdfFromImage(buf: Buffer): Promise<Buffer> {
  const jpg = await sharp(buf).jpeg({ quality: 90 }).toBuffer();
  const pdf = await PDFDocument.create();
  const img = await pdf.embedJpg(jpg);
  const A4W = 595.28, A4H = 841.89;
  const page = pdf.addPage([A4W, A4H]);
  const sf = (A4W / img.width) * 0.9;
  const w = img.width * sf, h = img.height * sf;
  page.drawImage(img, { x: (A4W-w)/2, y: (A4H-h)/2, width: w, height: h });
  return Buffer.from(await pdf.save());
}
async function toRealSVG(buf: Buffer): Promise<string> {
  // Gri ton + threshold ile stencil benzeri çizgi üret
  return await trace(buf, {
    turdSize: 50,        // küçük lekeleri at
    threshold: 180,      // çizgi eşiği (ihtiyaca göre 160-200 arası oyna)
    optTolerance: 0.4,   // eğri optimizasyonu
    color: 'black',
    background: 'white'
  });
}

async function svgPlaceholder(): Promise<string> {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536">
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18">
    SVG placeholder – Potrace to be enabled in prod
  </text></svg>`;
}

export async function POST(req: Request) {
  const { refinedUrl, format = 'png' } = await req.json();
  try {
    const buf = Buffer.from(await (await fetch(refinedUrl)).arrayBuffer());
    if (format==='png') {
      const out = await sharp(buf).png({ quality: 95 }).toBuffer();
      return new NextResponse(out as any, { headers: { 'Content-Type':'image/png' }});
    }
    if (format==='pdf') {
      const out = await createPdfFromImage(buf);
      return new NextResponse(out as any, { headers: { 'Content-Type':'application/pdf' }});
    }
    if (format==='svg') {
      const svg = await toRealSVG(buf);
      return new NextResponse(svg, { headers: { 'Content-Type':'image/svg+xml' }});
    }
    return NextResponse.json({ ok:false, error:'Unsupported format' }, { status:400 });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error:`Export failed: ${e.message}` }, { status:500 });
  }
}
