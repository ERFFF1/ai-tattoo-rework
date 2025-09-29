export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const MAX = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg','image/png','image/webp'];

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if(!file) return NextResponse.json({ ok:false, error:'No file' }, { status:400 });
  if(file.size > MAX) return NextResponse.json({ ok:false, error:'>10MB' }, { status:400 });
  if(!ALLOWED.includes(file.type)) return NextResponse.json({ ok:false, error:`Invalid type: ${file.type}` }, { status:400 });

  try {
    const name = `original/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi,'_')}`;
    const blob = await put(name, file, { access:'public', contentType:file.type });
    return NextResponse.json({ ok:true, url: blob.url, pathname: blob.pathname });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error:`Upload failed: ${e.message}` }, { status:500 });
  }
}
