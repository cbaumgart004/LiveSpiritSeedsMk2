'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { Category } from '@/lib/types'

// Search box + category/tag filters. Reflects state in the URL so results are
// server-rendered and shareable.
export default function Filters({
  categories,
  tags,
}: {
  categories: Category[]
  tags: string[]
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const activeCat = params.get('category') ?? ''
  const activeTag = params.get('tag') ?? ''

  function apply(next: Record<string, string | undefined>) {
    const p = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    const qs = p.toString()
    router.push(qs ? `/?${qs}` : '/')
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          apply({ q: q || undefined })
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button type="submit" className="brand-btn px-4 py-2 text-sm font-medium">
          Search
        </button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!activeCat} onClick={() => apply({ category: undefined })}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={activeCat === c.slug}
              onClick={() => apply({ category: activeCat === c.slug ? undefined : c.slug })}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => apply({ tag: activeTag === t ? undefined : t })}
              className={`rounded-full px-2.5 py-1 text-xs transition ${
                activeTag === t ? 'brand-chip brand-chip--active' : 'brand-chip'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm transition ${
        active ? 'brand-chip brand-chip--active' : 'brand-chip'
      }`}
    >
      {children}
    </button>
  )
}
