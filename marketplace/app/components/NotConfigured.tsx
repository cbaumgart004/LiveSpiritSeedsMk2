export default function NotConfigured() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-amber-300 bg-amber-50 p-6 text-center">
      <h2 className="text-lg font-semibold text-amber-900">Store not configured yet</h2>
      <p className="mt-2 text-sm text-amber-800">
        Add your Supabase keys to <code className="rounded bg-amber-100 px-1">.env.local</code> and
        run the schema in <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code>. See{' '}
        <code className="rounded bg-amber-100 px-1">README.md</code> for the full setup.
      </p>
    </div>
  )
}
