import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getProductById } from '@/lib/data'
import { env, isStripeConfigured, isSupabaseConfigured } from '@/lib/config'

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Checkout is not configured yet.' }, { status: 503 })
  }

  let body: { productId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!body.productId) {
    return NextResponse.json({ error: 'Missing productId.' }, { status: 400 })
  }

  const product = await getProductById(body.productId)
  if (!product) {
    return NextResponse.json({ error: 'Product not available.' }, { status: 404 })
  }

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency,
          unit_amount: product.price_cents,
          product_data: {
            name: product.name,
            images: product.featured_image ? [product.featured_image] : undefined,
          },
        },
      },
    ],
    success_url: `${env.siteUrl}/product/${product.slug}?purchased=1`,
    cancel_url: `${env.siteUrl}/product/${product.slug}`,
    metadata: { product_id: product.id },
  })

  return NextResponse.json({ url: session.url })
}
