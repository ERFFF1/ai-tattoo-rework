export const runtime = 'nodejs';

import Stripe from 'stripe';
import { NextResponse } from 'next/server';
const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2023-10-16' });

export async function POST(req: Request) {
  const { mode='payment', plan='single' } = await req.json();
  const price = plan==='studio' ? process.env.STRIPE_PRICE_STUDIO
               : plan==='monthly' ? process.env.STRIPE_PRICE_MONTHLY
               : process.env.STRIPE_PRICE_SINGLE;

  const session = await stripe.checkout.sessions.create({
    mode: mode==='subscription' ? 'subscription' : 'payment',
    line_items: [{ price: price!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
  });
  return NextResponse.json({ url: session.url });
}
