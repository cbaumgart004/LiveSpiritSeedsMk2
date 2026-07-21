import Link from 'next/link'
import { formatMoney } from '@/lib/money'
import type { Product } from '@/lib/types'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="brand-card group flex flex-col overflow-hidden transition hover:shadow-lg"
    >
      <div className="aspect-square w-full overflow-hidden bg-black/5">
        {product.featured_image ? (
          <img
            src={product.featured_image}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center opacity-40">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="brand-subheading text-lg">{product.name}</h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((t) => (
            <span key={t} className="brand-chip rounded-full px-2 py-0.5 text-xs">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-auto pt-3 font-semibold" style={{ color: 'var(--primary-color)' }}>
          {formatMoney(product.price_cents, product.currency)}
        </p>
      </div>
    </Link>
  )
}
