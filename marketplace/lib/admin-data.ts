// Admin reads via the service-role client (sees drafts too). SERVER ONLY, and
// every caller must requireOwner() first — these functions do not re-check auth.
import { createAdminClient } from '@/lib/supabase/admin'
import type { Category, Product } from '@/lib/types'

export async function adminListProducts(): Promise<Product[]> {
  const sb = createAdminClient()
  const { data } = await sb.from('products').select('*').order('updated_at', { ascending: false })
  return (data as Product[]) ?? []
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const sb = createAdminClient()
  const { data } = await sb.from('products').select('*').eq('id', id).maybeSingle()
  return (data as Product) ?? null
}

export async function adminListCategories(): Promise<Category[]> {
  const sb = createAdminClient()
  const { data } = await sb.from('categories').select('id, name, slug').order('name')
  return (data as Category[]) ?? []
}
