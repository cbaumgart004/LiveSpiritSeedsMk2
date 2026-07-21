// Non-destructive Preview mode.
//
// Lets the owner try a UI style + season on the live content WITHOUT saving
// anything to the CMS ("preview before going live"). Entered via a URL param
// (?preview, ?style=refined, ?season=winter); the choice is held in
// sessionStorage so it survives navigation between pages, and never touches the
// git-backed Settings doc. Exiting clears it. See DESIGN.md §6.
//
// applyTheme / applyUiStyle already ignore invalid values, so bogus params are
// harmless — no validation needed here.
import { applyTheme, applyUiStyle } from '../cms/site'

const KEY = 'ssw:preview'

export function loadPreview() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

export function savePreview(preview) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(preview))
  } catch {
    /* private mode / storage full — preview just won't persist across pages */
  }
}

export function clearPreview() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// Seed preview state from the URL on load (params win over stored values), then
// persist it. Returns the active preview object, or null when not in preview.
export function initPreview(search) {
  const params = new URLSearchParams(search || '')
  const requested = params.has('preview') || params.has('style') || params.has('season')
  let preview = loadPreview()
  if (requested) {
    preview = {
      active: true,
      style: params.get('style') || preview?.style || null,
      season: params.get('season') || preview?.season || null,
    }
    savePreview(preview)
  }
  return preview?.active ? preview : null
}

// Apply a preview object over whatever the CMS already applied (so preview wins).
export function applyPreview(preview) {
  if (!preview) return
  if (preview.style) applyUiStyle(preview.style)
  if (preview.season) applyTheme(preview.season)
}
