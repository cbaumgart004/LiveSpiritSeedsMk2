import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import ActionBar from '../components/ActionBar'
import Blocks from '../components/cms/Blocks'
import SiteFooter, { valuesFooterOn } from '../components/SiteFooter'
import { useDocuments, usePageLayout, useSettings } from '../cms/site'

// Renders one Page by slug: `/` is the page whose slug is `home`, `/:slug` the
// page with that slug. Pages come from the Edge of the Map console (drafts
// included while the owner edits), else from the bundled content files.
const EVENTS_PAGE = 'upcoming'

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
  // With the values footer on, a Values section is drawn once, as the footer.
  const { settings } = useSettings()
  const footer = valuesFooterOn(settings)
  // Home shows a slideshow of her photos under the opening section until she
  // adds a Slideshow section of her own (Slideshow.jsx, PLACEHOLDER_MEDIA).
  const placeholder = useMemo(() => (slug === 'home' && !(page?.data?.blocks ?? []).some((b) => b._type === 'slideshow')
    ? { _type: 'slideshow', _placeholder: true } : null), [slug, page])
  const own = footer ? (page?.data?.blocks ?? []).filter((b) => b.layout !== 'values') : page?.data?.blocks ?? []
  // The events page lists the Events (EventList.jsx) first until she adds an
  // Upcoming events section of her own.
  const blocks = slug === EVENTS_PAGE && !own.some((b) => b._type === 'eventList')
    ? [{ _type: 'eventList', _auto: true }, ...own] : own

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
        <SiteFooter pages={docs} />
      </>
    )
  }

  return (
    <>
      <Nav />
      <ActionBar />
      {/* Click-to-edit names the page by id; a bundled copy is not in the
          console, so it names it by slug and the console finds the imported one. */}
      <main className="page-layout" data-eotm-layout data-cards={layout.cards}>
        <Blocks blocks={blocks} doc={page.id?.startsWith('bundled:') ? page.slug : page.id} layout={layout} placeholder={placeholder} />
      </main>
      <SiteFooter pages={docs} />
    </>
  )
}
