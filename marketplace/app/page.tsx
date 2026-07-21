import Filters from '@/app/components/Filters'
import ProductCard from '@/app/components/ProductCard'
import NotConfigured from '@/app/components/NotConfigured'
import { getCategories, getProducts, getAllTags } from '@/lib/data'
import { isSupabaseConfigured } from '@/lib/config'

// Storefront data changes with the catalog + query, so render per-request.
export const dynamic = 'force-dynamic'

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>
}) {
  if (!isSupabaseConfigured()) return <NotConfigured />

  const sp = await searchParams
  const [products, categories, tags] = await Promise.all([
    getProducts({ q: sp.q, category: sp.category, tag: sp.tag }),
    getCategories(),
    getAllTags(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="brand-heading text-4xl">Shop</h1>
        <p className="mt-1 text-sm opacity-70">Wellness goods, curated by Spirit Seeds.</p>
      </div>

      <Filters categories={categories} tags={tags} />

      {products.length === 0 ? (
        <p className="py-12 text-center text-stone-400">
          No products match. Try clearing filters or a different search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
