import NotConfigured from '@/app/components/NotConfigured'
import { requireOwner } from '@/lib/auth'
import { adminListCategories } from '@/lib/admin-data'
import { isAdminConfigured } from '@/lib/config'
import { createCategory, deleteCategory } from '../actions'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  if (!isAdminConfigured()) return <NotConfigured />
  await requireOwner()
  const categories = await adminListCategories()

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Categories</h1>

      <form action={createCategory} className="flex gap-2">
        <input
          name="name"
          placeholder="New category name"
          required
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button className="brand-btn px-4 py-2 text-sm font-medium">Add</button>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-stone-400">No categories yet.</p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span>
                {c.name} <span className="text-xs text-stone-400">/{c.slug}</span>
              </span>
              <form action={deleteCategory.bind(null, c.id)}>
                <button className="text-sm text-red-600 hover:underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
