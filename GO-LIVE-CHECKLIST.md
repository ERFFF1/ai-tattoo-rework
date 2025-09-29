# 🚀 AI Tattoo Rework v1.4 - Go-Live Checklist

## 1. Environment Variables (Vercel → Project Settings → Environment Variables)

### Required Variables:
```
LEONARDO_API_KEY=your_leonardo_key
GEMINI_API_KEY=your_gemini_key
STRIPE_SECRET=sk_live_...
STRIPE_PRICE_SINGLE=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_STUDIO=price_...
NEXT_PUBLIC_URL=https://your-domain.com
STORAGE_DRIVER=blob
```

### Optional Variables:
```
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 2. Database Migration
```bash
psql $DATABASE_URL -f scripts/migrate_addon.sql
```

## 3. Mockup Asset Generation
```bash
node scripts/make_mockup_placeholder.mjs
```

## 4. Stripe Webhook Setup
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://your-domain.com/api/webhook`
- Select events: `checkout.session.completed`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 5. Vercel Deployment
- Deploy to Preview first
- Test all endpoints
- Promote to Production
- Configure custom domain
- Verify `NEXT_PUBLIC_URL` is correct

## 6. Kill Switch Flags (lib/flags.ts)
```typescript
export const FLAGS = {
  PROVIDER_FAILOVER: true,    // Leonardo fallback
  VISION_QGATE: false,        // Keep off initially
  VECTOR_EXPORT: true,        // SVG with Potrace
  MOCKUP_WARP_V2: false,      // Keep V1 for now
  WATERMARK_FREE_PREVIEW: true,
};
```

## 7. Health Check
Test: `GET https://your-domain.com/api/health`
Expected: `{ "ok": true, "env": { "leonardo": true, "gemini": true, ... }, "ready": true }`

## 8. Smoke Tests

### Assist (Gemini)
```bash
curl -s -X POST "https://your-domain.com/api/assist" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://picsum.photos/800", "context":"soft sun halo, reduce noise", "mode":"pre-refine"}'
```

### Upload (Vercel Blob)
```bash
curl -s -X POST "https://your-domain.com/api/upload" \
  -F "file=@/path/to/local-image.png"
```

### Export PNG/PDF/SVG
```bash
curl -s -X POST "https://your-domain.com/api/export" \
  -H "Content-Type: application/json" \
  -d '{"refinedUrl":"https://picsum.photos/800", "format":"png"}' -o out.png

curl -s -X POST "https://your-domain.com/api/export" \
  -H "Content-Type: application/json" \
  -d '{"refinedUrl":"https://picsum.photos/800", "format":"pdf"}' -o out.pdf

curl -s -X POST "https://your-domain.com/api/export" \
  -H "Content-Type: application/json" \
  -d '{"refinedUrl":"https://picsum.photos/800", "format":"svg"}' -o out.svg
```

## 9. Legal Requirements
- Add footer with "Terms of Service" and "Privacy Policy" links
- Add copyright notice
- Consider GDPR compliance for EU users

## 10. Monitoring & Logs
- Enable Vercel Logs
- Consider Sentry for error tracking
- Monitor API usage and costs

## 11. E2E Testing
```bash
npm run test:e2e
```

## 12. Final Verification
1. Visit `/dashboard`
2. Test complete flow: Upload → Presets → Gemini Assist → Refine → Mockup → Export → Checkout
3. Verify all API endpoints respond correctly
4. Check Stripe webhook is receiving events
5. Monitor error logs for 24 hours

---

## 🎯 Success Criteria
- ✅ Health check returns `ready: true`
- ✅ All smoke tests pass
- ✅ E2E tests pass
- ✅ No critical errors in logs
- ✅ Stripe webhook receiving events
- ✅ File uploads working
- ✅ PDF/SVG exports working
- ✅ Gemini AI suggestions working
