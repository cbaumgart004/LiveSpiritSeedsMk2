export type Category = {
  id: string
  name: string
  slug: string
}

export type ProductStatus = 'draft' | 'active'

// Payload the admin form sends to the saveProduct server action. Lives here
// (not in actions.ts) because a 'use server' module may only export functions.
export type ProductInput = {
  id?: string
  name: string
  price: string // user-typed, e.g. "19.99"
  description: string
  categoryId: string | null
  tags: string // comma-separated
  status: ProductStatus
  themeOverride: string | null // '' / null = inherit store default
  uiStyleOverride: string | null
  featuredImage: string | null
  images: string[]
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  price_cents: number
  currency: string
  category_id: string | null
  tags: string[]
  status: ProductStatus
  theme: string | null
  ui_style: string | null
  featured_image: string | null
  images: string[]
  created_at: string
  updated_at: string
}
