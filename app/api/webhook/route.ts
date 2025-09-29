export const runtime = 'nodejs';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2023-10-16' });

// TODO: supabase/neon ile gerçek DB
async function updateCreditBalance(userId: string, credits: number) {
  console.log(`[DB] +${credits} credits to ${userId}`); return { success: true };
}
function creditsFromPrice(priceId?: string): number {
  if (!priceId) return 0;
  if (priceId===process.env.STRIPE_PRICE_SINGLE) return 5;
  if (priceId===process.env.STRIPE_PRICE_MONTHLY) return 10;
  if (priceId===process.env.STRIPE_PRICE_STUDIO) return 50;
  return 0;
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature'); const raw = await req.text();
  try {
    const evt = stripe.webhooks.constructEvent(raw, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    if (evt.type==='checkout.session.completed') {
      const s = evt.data.object as Stripe.Checkout.Session;
      const items = await stripe.checkout.sessions.listLineItems(s.id);
      const priceId = items.data[0]?.price?.id;
      const userId = s.customer_email || 'guest_user';
      const credits = creditsFromPrice(priceId);
      if (credits>0) await updateCreditBalance(userId, credits);
    }
    return NextResponse.json({ received:true });
  } catch(e:any) {
    return new NextResponse(`Webhook Error: ${e.message}`, { status:400 });
  }
}
