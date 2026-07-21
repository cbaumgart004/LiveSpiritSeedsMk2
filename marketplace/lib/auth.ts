import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server-only owner gate. Redirects to the login page when there is no session.
// Used by both admin pages and the write actions so every write is authenticated.
export async function requireOwner() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return user
}
