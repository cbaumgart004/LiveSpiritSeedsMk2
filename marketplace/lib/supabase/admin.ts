import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/config'

// Service-role client — SERVER ONLY. Bypasses row-level security, so never
// import this into a Client Component. Every call site must first verify the
// owner is authenticated (see app/admin/actions.ts requireOwner()).
export function createAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new Error('Supabase admin is not configured (missing URL or service-role key).')
  }
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
