import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import ActionBar from '../components/ActionBar'
import Blocks from '../components/cms/Blocks'
import { useDocuments, usePageLayout } from '../cms/site'

// Renders one Page by slug: `/` is the page whose slug is `home`, `/:slug` the
// page with that slug. Pages come from the Edge of the Map console (drafts
// included while the owner edits), else from the bundled content files.
export default function DynamicPage() {
  const { slug = 'home' } = useParams()
  const { ready, docs } = useDocuments('page')
  const page = docs.find((d) => d.slug === slug)
  // The page's Page layout (the console's pageLayout whose address is this one)
  // orders its sections and sets their widths on 12 columns.
  const { pathname } = useLocation()
  const idsKey = (page?.data?.blocks ?? []).map((b) => b._id).filter(Boolean).join('|')
  const keys = useMemo(() => (idsKey ? idsKey.split('|') : []), [idsKey])
  const layout = usePageLayout(pathname, keys)

  if (!ready) {
    return (
      <>
        <Nav />
        <ActionBar />
        <div className="page-wrapper first-section" style={{ padding: '2rem' }}>
          Loading…
        </div>
      </>
    )
  }

  if (!page) {
    return (
      <>
        <Nav />
        <ActionBar />
        <section className="section section--stack first-section">
          <div className="panel">
            <h2>Page not found</h2>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <Nav />
      <ActionBar />
      {/* Click-to-edit names the page by id; a bundled copy is not in the
          console, so it names it by slug and the console finds the imported one. */}
      <main className="page-layout" data-eotm-layout>
        <Blocks blocks={page.data?.blocks} doc={page.id?.startsWith('bundled:') ? page.slug : page.id} layout={layout} />
      </main>
    </>
  )
}
