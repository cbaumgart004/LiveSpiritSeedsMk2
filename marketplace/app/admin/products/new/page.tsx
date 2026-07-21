import ProductForm from '@/app/components/ProductForm'
import NotConfigured from '@/app/components/NotConfigured'
import { requireOwner } from '@/lib/auth'
import { adminListCategories } from '@/lib/admin-data'
import { isAdminConfigured } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  if (!isAdminConfigured()) return <NotConfigured />
  await requireOwner()
  const categories = await adminListCategories()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
