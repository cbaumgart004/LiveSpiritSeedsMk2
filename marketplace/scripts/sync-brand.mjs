// Copies the brochure site's current season + UX style into brand-settings.json
// so the store inherits it. Runs on predev/prebuild. If the brochure content
// isn't present in the build context (e.g. a standalone deploy), it skips and
// leaves the committed brand-settings.json (or env vars) as the source.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// Where to read the host site's { theme, uiStyle } from. Defaults to this repo's
// brochure settings; set BRAND_SETTINGS_SRC to repoint it (or ignore it entirely)
// when this package is dropped into another repo. Expects JSON with `theme` and
// `uiStyle` keys; absent → this step is skipped and the committed file/env win.
const src = process.env.BRAND_SETTINGS_SRC
  ? resolve(process.cwd(), process.env.BRAND_SETTINGS_SRC)
  : resolve(here, '../../content/settings/index.json')
const dest = resolve(here, '../brand-settings.json')

try {
  if (!existsSync(src)) {
    console.log('[sync-brand] brochure settings not found — keeping brand-settings.json')
  } else {
    const s = JSON.parse(readFileSync(src, 'utf8'))
    const out = { theme: s.theme ?? 'summer', uiStyle: s.uiStyle ?? 'watercolor' }
    writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
    console.log(`[sync-brand] synced: theme=${out.theme} uiStyle=${out.uiStyle}`)
  }
} catch (err) {
  console.log('[sync-brand] skipped:', err instanceof Error ? err.message : String(err))
}
