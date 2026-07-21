import LoginForm from '@/app/components/LoginForm'
import NotConfigured from '@/app/components/NotConfigured'
import { isSupabaseConfigured } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  if (!isSupabaseConfigured()) return <NotConfigured />
  return (
    <div className="mx-auto max-w-sm space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Owner sign in</h1>
        <p className="mt-1 text-sm text-stone-500">Manage products for the Spirit Seeds shop.</p>
      </div>
      <LoginForm />
    </div>
  )
}
