import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import Blocks from '../components/cms/Blocks'
import { useDocuments } from '../cms/site'

// Renders one Page by slug: `/` is the page whose slug is `home`, `/:slug` the
// page with that slug. Pages come from the Edge of the Map console (drafts
// included while the owner edits), else from the bundled content files.
export default function DynamicPage() {
  const { slug = 'home' } = useParams()
  const { ready, docs } = useDocuments('page')
  const page = docs.find((d) => d.slug === slug)

  if (!ready) {
    return (
      <>
        <Nav />
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
      {/* Click-to-edit names the page by id; a bundled copy is not in the
          console, so it names it by slug and the console finds the imported one. */}
      <Blocks blocks={page.data?.blocks} doc={page.id?.startsWith('bundled:') ? page.slug : page.id} />
    </>
  )
}
