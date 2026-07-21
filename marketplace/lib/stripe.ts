import Stripe from 'stripe'
import { env } from '@/lib/config'

// Lazily constructed so the module can be imported at build time without keys.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!env.stripeSecret) {
    throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY).')
  }
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecret)
  }
  return _stripe
}
