'use client'
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/config'

// Browser client — used by the owner login form to sign in with Supabase Auth.
export function createClient() {
  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!)
}
