// The site's content: pages and settings from the Edge of the Map console.
//
// index.html loads the console's loader, which installs window.EOTM. Published
// documents come from the console's public API; while the owner edits, the
// loader pushes drafts through window.EOTM and these hooks re-render with
// them, which is the live preview.
//
// Until the console holds pages (or when it cannot be reached), the site
// renders the TinaCMS files bundled from content/, converted to the console's
// shape (fromTina.js), so the site never shows less than it did under Tina.
// Settings fall back field by field the same way.

import { useEffect, useMemo, useState } from 'react'
import { pageFromTina, settingsFromTina } from './fromTina.js'
import bundledSettings from '../../content/settings/index.json'

export const CONSOLE_API = 'https://admin.theedgeofthemap.com/api/sites/spiritseeds'
export const SEASONS = ['spring', 'summer', 'fall', 'winter']
export const UI_STYLES = ['watercolor', 'editorial', 'sanctuary', 'immersive']

const bundledPages = Object.entries(import.meta.glob('../../content/pages/*.json', { eager: true, import: 'default' }))
  .map(([path, file]) => {
    const { slug, data } = pageFromTina(path.split('/').pop().replace(/\.json$/, ''), file)
    return { id: `bundled:${slug}`, type: 'page', slug, data }
  })
const BUNDLED = {
  page: bundledPages,
  settings: [{ id: 'bundled:settings', type: 'settings', slug: 'settings', data: settingsFromTina(bundledSettings) }],
}

// One request per type per page load, shared by every component asking.
// Resolves to null when the console cannot be reached.
const published = new Map()
function fetchPublished(type) {
  if (!published.has(type)) {
    published.set(type, fetch(`${CONSOLE_API}/public/${encodeURIComponent(type)}`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null))
  }
  return published.get(type)
}

// Documents of one type: published ones with the owner's drafts on top, or
// the bundled files while the console has none. `ready` is false until the
// console has answered, so a page does not flash the bundled copy first.
export function useDocuments(type) {
  const [docs, setDocs] = useState(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let active = true
    fetchPublished(type).then((d) => active && setDocs(d?.length ? d : BUNDLED[type] ?? []))
    let unsubscribe = null
    let timer = null
    const wire = () => {
      if (window.EOTM) unsubscribe = window.EOTM.subscribe((c) => c.type === type && !c.order && setTick((t) => t + 1))
      else timer = setTimeout(wire, 50)
    }
    wire()
    return () => {
      active = false
      clearTimeout(timer)
      if (unsubscribe) unsubscribe()
    }
  }, [type])
  return useMemo(() => {
    if (!docs) return { ready: false, docs: [] }
    return { ready: true, docs: window.EOTM ? window.EOTM.merge(type, docs) : docs }
  }, [type, docs, tick]) // eslint-disable-line react-hooks/exhaustive-deps
}

// Site settings: the console's singleton over the bundled file, field by field.
export function useSettings() {
  const { ready, docs } = useDocuments('settings')
  return useMemo(() => {
    const data = { ...BUNDLED.settings[0].data }
    for (const [k, v] of Object.entries(docs[0]?.data ?? {})) if (v !== '' && v != null) data[k] = v
    return { ready, settings: data }
  }, [ready, docs])
}

// Pages for the menu: shown ones, by `order`.
export function navLinks(pages) {
  return pages
    .filter((p) => p.data?.showInNav !== false)
    .map((p) => ({ slug: p.slug, label: p.data?.navLabel || p.data?.title || p.slug, order: p.data?.order ?? 999 }))
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

// Apply the UI style (from Settings) to <body> as a `style-<x>` class. This is
// the second, color-independent axis (see DESIGN.md §6). Invalid/missing values
// are ignored so the build-time default applied in main.jsx stays in place.
export function applyUiStyle(uiStyle) {
  if (!UI_STYLES.includes(uiStyle)) return
  document.body.classList.remove(...UI_STYLES.map((s) => `style-${s}`))
  document.body.classList.add(`style-${uiStyle}`)
}
