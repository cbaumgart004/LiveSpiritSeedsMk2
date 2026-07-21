import Link from 'next/link'
import { notFound } from 'next/navigation'
import Markdown from '@/app/components/Markdown'
import BuyButton from '@/app/components/BuyButton'
import NotConfigured from '@/app/components/NotConfigured'
import { getProductBySlug } from '@/lib/data'
import { isSupabaseConfigured } from '@/lib/config'
import { formatMoney } from '@/lib/money'
import { themeClass } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  if (!isSupabaseConfigured()) return <NotConfigured />

  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const gallery = [product.featured_image, ...product.images].filter(Boolean) as string[]

  return (
    // Re-scope the brand palette/style for this product if it has an override.
    <div className={themeClass({ season: product.theme, uiStyle: product.ui_style })}>
      <div className="space-y-6">
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          ← Back to shop
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <div
              className="aspect-square overflow-hidden border"
              style={{ borderRadius: 'var(--radius-2)', borderColor: 'var(--primary-color)' }}
            >
              {gallery[0] ? (
                <img src={gallery[0]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center opacity-40">No image</div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {gallery.slice(1).map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="brand-heading text-4xl">{product.name}</h1>
              <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--primary-color)' }}>
                {formatMoney(product.price_cents, product.currency)}
              </p>
            </div>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/?tag=${encodeURIComponent(t)}`}
                    className="brand-chip rounded-full px-2.5 py-1 text-xs"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {product.description && <Markdown>{product.description}</Markdown>}

            <BuyButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
