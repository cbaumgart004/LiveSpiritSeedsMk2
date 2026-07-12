// Small data helpers over the generated TinaCMS client.
import { client } from '../../tina/__generated__/client'

const SEASONS = ['spring', 'summer', 'fall', 'winter']

// Load the single Site Settings document.
export async function loadSettings() {
  const res = await client.queries.settings({ relativePath: 'index.json' })
  return res.data.settings
}

// Apply the seasonal theme (from Settings) to <body>.
export function applyTheme(theme) {
  if (!SEASONS.includes(theme)) return
  document.body.classList.remove(...SEASONS)
  document.body.classList.add(theme)
}
