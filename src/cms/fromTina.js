// TinaCMS content files in the Edge of the Map console's shape.
//
// The console schema (the `console` branch of edgeOfTheMap,
// console/schema/sites/spiritseeds.json) mirrors tina/config.ts field for field;
// what differs is only how values are stored:
//
//   Tina                          console
//   _template: 'service'          _type: 'service', plus an _id per section and row
//   image: '/uploads/a.jpg'       image: { src: '/uploads/a.jpg', alt: '' }
//   body: '**Markdown**'          body: '<p><strong>HTML</strong></p>'
//   images: ['/a.jpg']            images: [{ _id, image: { src, alt } }]
//   words: ['Grace']              words: [{ _id, text: 'Grace' }]
//
// Used twice: by scripts/import-to-console.mjs to move the content in, and by
// src/cms/site.js to render the bundled files while the console has none. Ids
// are derived from position, so the same file always converts the same way.

import { markdownToHtml } from './markdown.js'

const RICH = { contentSection: ['body'], service: ['description'], embed: [] }
const IMAGE = ['image']

const img = (src) => (typeof src === 'string' && src.trim() ? { src: src.trim(), alt: '' } : null)

// A Tina value that means "not set" is dropped, so the console's defaults apply.
const blank = (v) => v === '' || v == null

function rows(list, prefix, fn = (x) => x) {
  return (Array.isArray(list) ? list : []).map((item, i) => ({ _id: `${prefix}-${i}`, ...fn(item, `${prefix}-${i}`) }))
}

function convertBlock(block, id) {
  const type = block._template
  const out = { _id: id, _type: type }
  for (const [key, value] of Object.entries(block)) {
    if (key === '_template' || blank(value)) continue
    if (RICH[type]?.includes(key)) out[key] = markdownToHtml(value)
    else if (IMAGE.includes(key)) out[key] = img(value)
    else if (key === 'images') out.images = rows(value.filter(Boolean), `${id}-img`, (src) => ({ image: img(src) }))
    else if (key === 'words') out.words = rows(value.filter(Boolean), `${id}-w`, (text) => ({ text }))
    else if (key === 'cards') out.cards = rows(value, `${id}-card`, (c) => ({ ...c, image: img(c.image) }))
    else if (key === 'buttons') out.buttons = rows(value, `${id}-btn`)
    else if (key === 'bookingOptions') {
      out.bookingOptions = rows(value, `${id}-opt`, (o, oid) => ({ ...o, addOns: rows(o.addOns, `${oid}-add`) }))
    } else out[key] = value
  }
  // Tina's pre-2026 splash flag, kept working by the renderer; the console
  // has only the placement field.
  if (out.withTagline && !out.taglinePlacement) out.taglinePlacement = 'beside'
  delete out.withTagline
  return out
}

// A page file: { title, navLabel, order, showInNav, blocks }. `slug` is the
// file name without .json ('home' is the index).
export function pageFromTina(slug, file) {
  const data = {
    title: file.title ?? slug,
    navLabel: file.navLabel ?? '',
    order: typeof file.order === 'number' ? file.order : 99,
    showInNav: file.showInNav !== false,
    blocks: (file.blocks ?? []).filter((b) => RICH[b?._template]).map((b, i) => convertBlock(b, `${slug}-${i}`)),
  }
  return { slug, data }
}

export function settingsFromTina(file) {
  const data = {}
  for (const [key, value] of Object.entries(file ?? {})) {
    if (blank(value) || key === 'previewLink') continue
    data[key] = key === 'logo' ? img(value) : value
  }
  return data
}
