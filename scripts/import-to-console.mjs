// Copies the TinaCMS content (content/pages/*.json, content/settings/index.json)
// into the Edge of the Map console as published documents, converted by
// src/cms/fromTina.js. Run it once when the site moves to the console, and
// again at cutover to carry over anything edited in Tina since.
//
//   node scripts/import-to-console.mjs --dry-run            # convert and list only
//   EOTM_TOKEN=<editor token> node scripts/import-to-console.mjs
//   EOTM_TOKEN=<editor token> node scripts/import-to-console.mjs --replace
//
// A page or the settings the console already has is skipped, so edits made in
// the console survive a re-run; --replace overwrites them with Tina's copy.
//
// The token is the editor token the console keeps for this tab: on the site
// with the editor open, run sessionStorage.getItem('eotm:token:spiritseeds') in
// the browser's developer console. It lasts 8 hours and edits only this site.
// Never commit it or paste it into a file.

import { readFileSync, readdirSync } from 'node:fs'
import { pageFromTina, settingsFromTina } from '../src/cms/fromTina.js'

const API = process.env.EOTM_API ?? 'https://admin.theedgeofthemap.com/api/sites/spiritseeds'
const dryRun = process.argv.includes('--dry-run')
const replace = process.argv.includes('--replace')
const token = process.env.EOTM_TOKEN

const read = (rel) => JSON.parse(readFileSync(new URL(`../content/${rel}`, import.meta.url), 'utf8'))
const pages = readdirSync(new URL('../content/pages/', import.meta.url))
  .filter((f) => f.endsWith('.json'))
  .map((f) => pageFromTina(f.replace(/\.json$/, ''), read(`pages/${f}`)))
const settings = settingsFromTina(read('settings/index.json'))

if (dryRun) {
  for (const p of pages) console.log(`page ${p.slug.padEnd(20)} ${p.data.title} (${p.data.blocks.length} sections)`)
  console.log(`settings: ${Object.keys(settings).join(', ')}`)
  console.log('Nothing sent.')
  process.exit(0)
}
if (!token) {
  console.error('Set EOTM_TOKEN to an editor token (see the top of this file), or pass --dry-run.')
  process.exit(1)
}

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${data.error ?? ''} ${(data.errors ?? []).join('; ')}`.trim())
  return data
}

// Creates or (with --replace) overwrites one document, then publishes it.
async function put(type, slug, data) {
  const existing = (await call('GET', `/documents?type=${type}`)).find((d) => d.slug === slug)
  if (existing && !replace) return `kept   ${type} ${slug} (already in the console)`
  const doc = existing
    ? await call('PUT', `/documents/${existing.id}`, { baseVersion: existing.version, data })
    : await call('POST', '/documents', { type, slug, data })
  await call('POST', `/documents/${doc.id}/publish`, { baseVersion: doc.version })
  return `${existing ? 'replaced' : 'created '} ${type} ${slug}`
}

let failed = 0
for (const [type, slug, data] of [['settings', 'settings', settings], ...pages.map((p) => ['page', p.slug, p.data])]) {
  try {
    console.log(await put(type, slug, data))
  } catch (err) {
    failed++
    console.error(`FAILED ${type} ${slug}: ${err.message}`)
  }
}
process.exit(failed ? 1 : 0)
