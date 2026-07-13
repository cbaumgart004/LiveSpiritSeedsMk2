// Small data helpers over the generated TinaCMS client.
import { client } from '../../tina/__generated__/client'

const SEASONS = ['spring', 'summer', 'fall', 'winter']

// Load the single Site Settings document.
export async function loadSettings() {
  const res = await client.queries.settings({ relativePath: 'index.json' })
  return res.data.settings
}

// Load pages for the nav: visible ones, sorted by `order`.
export async function loadPages() {
  const res = await client.queries.pageConnection()
  return (res.data.pageConnection.edges || [])
    .map((edge) => edge.node)
    .filter((node) => node.showInNav !== false)
    .map((node) => ({
      slug: node._sys.filename,
      label: node.navLabel || node.title,
      order: node.order ?? 999,
    }))
    .sort((a, b) => a.order - b.order)
}

// Map a page slug to its route ('home' is the index).
export function hrefForSlug(slug) {
  return slug === 'home' ? '/' : `/${slug}`
}

// Apply the seasonal theme (from Settings) to <body>.
export function applyTheme(theme) {
  if (!SEASONS.includes(theme)) return
  document.body.classList.remove(...SEASONS)
  document.body.classList.add(theme)
}
