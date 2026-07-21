// Central place to read env + know whether the store is wired up yet. This lets
// every data page render a friendly "not configured" notice (instead of
// crashing) before the owner has added Supabase/Stripe keys — so `next build`
// and a fresh clone both work out of the box.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  stripeSecret: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}

export function isAdminConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceKey)
}

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecret)
}
