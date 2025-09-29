export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function GET() {
  const ready = !!process.env.LEONARDO_API_KEY && !!process.env.GEMINI_API_KEY;
  return NextResponse.json({
    ok: true,
    env: {
      leonardo: !!process.env.LEONARDO_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      stripe: !!process.env.STRIPE_SECRET,
      storage: process.env.STORAGE_DRIVER || 'unset'
    },
    ready
  });
}
