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

// The site's schema, with the owner's own types (the console's schema/custom.js):
// the live one while the editor is open, else the console's public boot answer.
// Null until known, or when the console cannot be reached.
let bootSchema = null
export function useSchema() {
  const [schema, setSchema] = useState(() => window.EOTM?.schema ?? null)
  useEffect(() => {
    let active = true
    bootSchema ??= fetch(`${CONSOLE_API}/boot`).then((r) => (r.ok ? r.json() : null)).then((b) => b?.schema ?? null).catch(() => null)
    bootSchema.then((s) => active && !window.EOTM?.schema && s && setSchema(s))
    let unsubscribe = null
    let timer = null
    const wire = () => {
      if (!window.EOTM) { timer = setTimeout(wire, 50); return }
      if (window.EOTM.schema) setSchema(window.EOTM.schema)
      unsubscribe = window.EOTM.subscribe((c) => c.type === '$schema' && setSchema(window.EOTM.schema))
    }
    wire()
    return () => {
      active = false
      clearTimeout(timer)
      if (unsubscribe) unsubscribe()
    }
  }, [])
  return schema
}

// The owner's arrangement of one page (the console's pageLayout, whose `blocks`
// is [{ key, span }]: page order, width in columns of 12), keyed by section _id.
// Sections it does not name follow in the page's order at full width; names the
// page no longer has are ignored. `keys` must be a stable array.
export function usePageLayout(path, keys) {
  const { docs } = useDocuments('pageLayout')
  return useMemo(() => {
    const doc = docs.find((d) => d.data?.path === path)
    const out = (doc?.data?.blocks ?? []).filter((b) => keys.includes(b?.key))
    for (const key of keys) if (!out.some((b) => b.key === key)) out.push({ key, span: 12 })
    // Which console document a block opens for click-to-edit.
    out.docId = doc?.id ?? null
    return out
  }, [docs, path, keys])
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

// The season and UI style last read from Settings, kept in this browser so
// main.jsx paints the next visit in them. The bundled file's season is only a
// build-time snapshot, so without this every visit opened in that season and
// switched once the console answered.
export const LOOK_KEY = 'ss:look'
export function rememberLook(settings) {
  const { theme, uiStyle, headingFont, subheadingFont, bodyFont, textSize } = settings
  try {
    localStorage.setItem(LOOK_KEY, JSON.stringify({ theme, uiStyle, headingFont, subheadingFont, bodyFont, textSize }))
  } catch { /* private mode: the bundled season paints first */ }
}

// The owner's fonts and text size (Site settings). Every rule names its face
// through --font-heading, --font-subheading and --font-body, which each UI
// style sets on <body>; an inline value on <body> wins over the style's, and
// "default" (or blank) removes it so the style's own face returns. Only faces
// the site already loads are offered (index.css, index.html).
const FONTS = {
  'Euphoria Script': 'cursive',
  Caveat: 'cursive',
  Farsan: 'cursive',
  'Playfair Display': 'Georgia, serif',
  Fraunces: 'Georgia, serif',
  'Cormorant Garamond': 'Georgia, serif',
  'Merriweather Sans': 'sans-serif',
  Assistant: 'sans-serif',
}
export function applyFonts({ headingFont, subheadingFont, bodyFont, textSize } = {}) {
  const body = document.body.style
  for (const [prop, face] of [['--font-heading', headingFont], ['--font-subheading', subheadingFont], ['--font-body', bodyFont]]) {
    if (FONTS[face]) body.setProperty(prop, `'${face}', ${FONTS[face]}`)
    else body.removeProperty(prop)
  }
  // Every size is in rem, so the root size scales all text together.
  const size = Number(textSize)
  if (size >= 85 && size <= 125 && size !== 100) document.documentElement.style.fontSize = `${size}%`
  else document.documentElement.style.removeProperty('font-size')
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
