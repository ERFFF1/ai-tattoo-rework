# AI Tattoo Rework – Integration Pack v1.4 (Non-Destructive)
- Multi-provider refine (Leonardo → Stability fallback)
- Gemini AI Assist (Vision analysis + suggestions)
- File upload (Vercel Blob storage)
- Mockup V1 (multiply triceps) + V2 skeleton (landmarks)
- Export PNG/PDF/SVG (PDF: pdf-lib, SVG: placeholder)
- Quality Gate (pixel + optional Vision)
- Rate limiting (Upstash Redis)
- Credit system (Stripe webhook integration)
- Presets
- Stripe (single + subscription + webhook)
- DB: addon_* tabloları (non-destructive)

## Kurulum
1) `psql $DATABASE_URL -f scripts/migrate_addon.sql`
2) .env keys → Vercel (Leonardo, Stability, Gemini, Stripe, Upstash)
3) `npm i @google/generative-ai lucide-react sharp stripe pdf-lib @vercel/blob form-data @upstash/redis @upstash/ratelimit`
4) `node scripts/make_mockup_placeholder.mjs`
5) Deploy (Vercel)

## Akış
Upload (URL/File) → Presets → Gemini Assist → Refine → Mockup → Export → Checkout

## Yeni Özellikler v1.4
- ✅ File upload with Vercel Blob
- ✅ PDF export with pdf-lib
- ✅ Rate limiting with Upstash
- ✅ Credit system with Stripe webhook
- ✅ Gemini AI assist integration
- 🔄 SVG export (Potrace placeholder)
- 🔄 Mockup V2 (landmarks skeleton)
- 🔄 Stability multipart implementation
