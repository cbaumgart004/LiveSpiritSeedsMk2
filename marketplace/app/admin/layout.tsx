import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/config'
import { signOut } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Show the admin nav only when signed in, so the login page stays clean.
  let signedIn = false
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    signedIn = Boolean(user)
  }

  return (
    <div>
      {signedIn && (
        <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="font-medium hover:text-emerald-700">
              Products
            </Link>
            <Link href="/admin/categories" className="font-medium hover:text-emerald-700">
              Categories
            </Link>
            <Link href="/" target="_blank" className="text-stone-500 hover:text-stone-800">
              View store ↗
            </Link>
          </nav>
          <form action={signOut}>
            <button className="text-sm text-stone-500 hover:text-stone-800">Sign out</button>
          </form>
        </div>
      )}
      {children}
    </div>
  )
}
