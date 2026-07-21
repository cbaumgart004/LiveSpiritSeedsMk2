'use client'
import { useRef, useState } from 'react'
import { saveProduct, uploadImage } from '@/app/admin/actions'
import type { Category, Product, ProductInput } from '@/lib/types'
import { SEASONS, UI_STYLES } from '@/lib/brand'

export default function ProductForm({
  categories,
  product,
}: {
  categories: Category[]
  product?: Product
}) {
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product ? (product.price_cents / 100).toString() : '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [tags, setTags] = useState(product ? product.tags.join(', ') : '')
  const [status, setStatus] = useState<'draft' | 'active'>(product?.status ?? 'draft')
  const [featuredImage, setFeaturedImage] = useState<string | null>(product?.featured_image ?? null)
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [themeOverride, setThemeOverride] = useState(product?.theme ?? '')
  const [uiStyleOverride, setUiStyleOverride] = useState(product?.ui_style ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const descRef = useRef<HTMLTextAreaElement>(null)

  async function doUpload(file: File): Promise<string | null> {
    setBusy(true)
    setError(null)
    const fd = new FormData()
    fd.set('file', file)
    const res = await uploadImage(fd)
    setBusy(false)
    if (res.error) {
      setError(res.error)
      return null
    }
    return res.url ?? null
  }

  async function onFeatured(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await doUpload(file)
    if (url) setFeaturedImage(url)
    e.target.value = ''
  }

  async function onGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await doUpload(file)
    if (url) setImages((prev) => [...prev, url])
    e.target.value = ''
  }

  async function onInline(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await doUpload(file)
    if (url) {
      const md = `\n![${file.name}](${url})\n`
      const ta = descRef.current
      if (ta) {
        const at = ta.selectionStart
        setDescription((d) => d.slice(0, at) + md + d.slice(at))
      } else {
        setDescription((d) => d + md)
      }
    }
    e.target.value = ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const input: ProductInput = {
      id: product?.id,
      name,
      price,
      description,
      categoryId: categoryId || null,
      tags,
      status,
      themeOverride: themeOverride || null,
      uiStyleOverride: uiStyleOverride || null,
      featuredImage,
      images,
    }
    const res = await saveProduct(input)
    // On success saveProduct redirects; we only get here on error.
    if (res?.error) {
      setError(res.error)
      setSaving(false)
    }
  }

  const label = 'block text-sm font-medium text-stone-700'
  const field =
    'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-500'

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <div>
        <label className={label}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={field} />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className={label}>Price (USD)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="19.99"
            inputMode="decimal"
            className={field}
          />
        </div>
        <div className="flex-1">
          <label className={label}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'active')}
            className={field}
          >
            <option value="draft">Draft (hidden)</option>
            <option value="active">Active (live)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className={label}>Category</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value)}
            className={field}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className={label}>Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="calming, herbal, gift"
            className={field}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={label}>Description (markdown)</label>
          <label className="cursor-pointer text-xs text-emerald-700 hover:underline">
            {busy ? 'Uploading…' : '+ Insert image'}
            <input type="file" accept="image/*" onChange={onInline} className="hidden" />
          </label>
        </div>
        <textarea
          ref={descRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder="Describe the product. Use **bold**, lists, and inline images."
          className={`${field} font-mono`}
        />
      </div>

      <div>
        <label className={label}>Featured image</label>
        <div className="mt-2 flex items-center gap-4">
          {featuredImage ? (
            <img src={featuredImage} alt="" className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-stone-100" />
          )}
          <div className="flex flex-col gap-1">
            <label className="cursor-pointer text-sm text-emerald-700 hover:underline">
              Upload featured image
              <input type="file" accept="image/*" onChange={onFeatured} className="hidden" />
            </label>
            {featuredImage && (
              <button
                type="button"
                onClick={() => setFeaturedImage(null)}
                className="text-left text-xs text-stone-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className={label}>Gallery images</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((src) => (
            <div key={src} className="relative">
              <img src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-stone-800 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-2xl text-stone-400 hover:border-emerald-500">
            +
            <input type="file" accept="image/*" onChange={onGallery} className="hidden" />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
        <p className={label}>Appearance (optional override)</p>
        <p className="mt-0.5 text-xs text-stone-500">
          Leave on “Inherit” to match the site’s current season &amp; style. Set these only to give
          this product its own look.
        </p>
        <div className="mt-3 flex gap-4">
          <div className="flex-1">
            <label className="text-xs text-stone-500">Season</label>
            <select
              value={themeOverride}
              onChange={(e) => setThemeOverride(e.target.value)}
              className={field}
            >
              <option value="">Inherit</option>
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-stone-500">Style</label>
            <select
              value={uiStyleOverride}
              onChange={(e) => setUiStyleOverride(e.target.value)}
              className={field}
            >
              <option value="">Inherit</option>
              {UI_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 border-t border-stone-200 pt-4">
        <button
          type="submit"
          disabled={saving || busy}
          className="brand-btn px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save product'}
        </button>
        <a href="/admin" className="text-sm text-stone-500 hover:text-stone-800">
          Cancel
        </a>
      </div>
    </form>
  )
}
