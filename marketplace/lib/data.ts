// Public storefront reads. Uses the anon key; row-level security limits results
// to ACTIVE products, so this is safe to call from server components.
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/config'
import type { Category, Product } from '@/lib/types'

function publicClient() {
  return createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: { persistSession: false },
  })
}

export async function getCategories(): Promise<Category[]> {
  const sb = publicClient()
  const { data } = await sb.from('categories').select('id, name, slug').order('name')
  return data ?? []
}

export type ProductFilters = { q?: string; category?: string; tag?: string }

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const sb = publicClient()
  let query = sb
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters.category) {
    const { data: cat } = await sb
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .maybeSingle()
    if (!cat?.id) return []
    query = query.eq('category_id', cat.id)
  }
  if (filters.tag) query = query.contains('tags', [filters.tag])
  if (filters.q && filters.q.trim()) {
    query = query.textSearch('search', filters.q.trim(), { type: 'websearch' })
  }

  const { data } = await query
  return (data as Product[]) ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = publicClient()
  const { data } = await sb
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()
  return (data as Product) ?? null
}

export async function getProductById(id: string): Promise<Product | null> {
  const sb = publicClient()
  const { data } = await sb
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle()
  return (data as Product) ?? null
}

export async function getAllTags(): Promise<string[]> {
  const sb = publicClient()
  const { data } = await sb.from('products').select('tags').eq('status', 'active')
  const set = new Set<string>()
  ;((data as { tags: string[] }[]) ?? []).forEach((row) =>
    (row.tags ?? []).forEach((t) => set.add(t))
  )
  return [...set].sort()
}
