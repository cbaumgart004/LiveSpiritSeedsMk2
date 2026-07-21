import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/config'

// Request-scoped Supabase client bound to the auth cookie. Used to read the
// signed-in owner's session (RLS-limited: only sees what the anon key can).
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component (read-only cookies); safe to ignore —
          // session refresh is handled by middleware / route handlers.
        }
      },
    },
  })
}
