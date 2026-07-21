import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { env, isStripeConfigured } from '@/lib/config'

// Stripe posts here after a payment. Verifies the signature against the raw body
// (App Router route handlers give us the raw body via request.text()).
export async function POST(request: Request) {
  if (!isStripeConfigured() || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature ?? '', env.stripeWebhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    // TODO (fulfillment): record the order, decrement inventory if tracked, and
    // email the buyer/owner. event.data.object is the completed Checkout Session;
    // session.metadata.product_id identifies the item.
  }

  return NextResponse.json({ received: true })
}
