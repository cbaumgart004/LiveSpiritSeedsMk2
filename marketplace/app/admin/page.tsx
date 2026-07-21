import Link from 'next/link'
import { requireOwner } from '@/lib/auth'
import { adminListProducts } from '@/lib/admin-data'
import { isAdminConfigured } from '@/lib/config'
import NotConfigured from '@/app/components/NotConfigured'
import { formatMoney } from '@/lib/money'
import { deleteProduct } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  if (!isAdminConfigured()) return <NotConfigured />
  await requireOwner()
  const products = await adminListProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="brand-btn px-4 py-2 text-sm font-medium">
          + New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-10 text-center text-stone-400">No products yet. Add your first one.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.featured_image ? (
                        <img
                          src={p.featured_image}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-stone-100" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatMoney(p.price_cents, p.currency)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-emerald-700 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deleteProduct.bind(null, p.id)}>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
