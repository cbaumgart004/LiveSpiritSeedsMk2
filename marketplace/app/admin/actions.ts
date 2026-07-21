'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireOwner } from '@/lib/auth'
import { parsePriceToCents } from '@/lib/money'
import type { ProductInput } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Ensure the product slug is unique (append -2, -3, … on collision).
async function uniqueSlug(sb: SupabaseClient, base: string, excludeId?: string): Promise<string> {
  const root = base || crypto.randomUUID()
  let slug = root
  let n = 1
  for (;;) {
    const { data } = await sb.from('products').select('id').eq('slug', slug).maybeSingle()
    if (!data || data.id === excludeId) return slug
    n += 1
    slug = `${root}-${n}`
  }
}

export async function saveProduct(input: ProductInput): Promise<{ error?: string }> {
  await requireOwner()
  const name = input.name.trim()
  if (!name) return { error: 'Name is required.' }

  const sb = createAdminClient()
  const tags = input.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const base = {
    name,
    description: input.description ?? '',
    price_cents: parsePriceToCents(input.price),
    category_id: input.categoryId || null,
    tags,
    status: input.status,
    theme: input.themeOverride || null,
    ui_style: input.uiStyleOverride || null,
    featured_image: input.featuredImage || null,
    images: input.images ?? [],
    updated_at: new Date().toISOString(),
  }

  if (input.id) {
    const slug = await uniqueSlug(sb, slugify(name), input.id)
    const { error } = await sb
      .from('products')
      .update({ ...base, slug })
      .eq('id', input.id)
    if (error) return { error: error.message }
  } else {
    const slug = await uniqueSlug(sb, slugify(name))
    const { error } = await sb.from('products').insert({ ...base, slug })
    if (error) return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  redirect('/admin')
}

export async function deleteProduct(id: string): Promise<void> {
  await requireOwner()
  const sb = createAdminClient()
  await sb.from('products').delete().eq('id', id)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireOwner()
  const file = formData.get('file')
  if (!(file instanceof File)) return { error: 'No file provided.' }

  const sb = createAdminClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${crypto.randomUUID()}.${ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { error } = await sb.storage
    .from('product-images')
    .upload(path, bytes, { contentType: file.type || 'image/jpeg' })
  if (error) return { error: error.message }

  const { data } = sb.storage.from('product-images').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function createCategory(formData: FormData): Promise<void> {
  await requireOwner()
  const name = String(formData.get('name') || '').trim()
  if (!name) return
  const sb = createAdminClient()
  await sb.from('categories').insert({ name, slug: slugify(name) })
  revalidatePath('/admin/categories')
  revalidatePath('/')
}

export async function deleteCategory(id: string): Promise<void> {
  await requireOwner()
  const sb = createAdminClient()
  await sb.from('categories').delete().eq('id', id)
  revalidatePath('/admin/categories')
  revalidatePath('/')
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
