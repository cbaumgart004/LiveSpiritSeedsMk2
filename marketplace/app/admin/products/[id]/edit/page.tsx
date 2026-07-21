import { notFound } from 'next/navigation'
import ProductForm from '@/app/components/ProductForm'
import NotConfigured from '@/app/components/NotConfigured'
import { requireOwner } from '@/lib/auth'
import { adminGetProduct, adminListCategories } from '@/lib/admin-data'
import { isAdminConfigured } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!isAdminConfigured()) return <NotConfigured />
  await requireOwner()
  const { id } = await params
  const [product, categories] = await Promise.all([adminGetProduct(id), adminListCategories()])
  if (!product) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
