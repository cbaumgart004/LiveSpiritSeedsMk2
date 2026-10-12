// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { applyFonts, applyTheme, applyUiStyle, fetchPublished } from './cms/site'
import { SITE_THEME, SITE_UI_STYLE } from './config/siteConfig.js'
// Content is git-backed and static, so the current theme is known at build time.
// Importing it here bakes the correct season into the first paint — no
// spring→summer flash while the CMS Settings doc loads async in App.
import settings from '../content/settings/index.json'

import './styles/variables.css'
import './styles/themes.css'
import './styles/index.css' // base element styles
import './styles/layout.css' // shared layout patterns
import './styles/components.css' // buttons/cards/etc
import './styles/ui-styles.css' // UI-style axis (must override the primitives above)
import './styles/animations.css' // keyframes/animation helpers

// Apply the real theme + UI style before render (the SITE_* constants are only
// fallbacks for a missing/invalid Settings value). Both are baked from the
// build-time Settings import so the first paint is already correct — no flash.
const SEASONS = ['spring', 'summer', 'fall', 'winter']
const UI_STYLES = ['watercolor', 'editorial', 'sanctuary', 'immersive']
// The season and style this browser last read from the console come first
// (site.js rememberLook): the bundled file is a build-time snapshot and goes
// stale as soon as the owner switches season in the editor.
const remembered = (() => {
  try {
    return JSON.parse(localStorage.getItem('ss:look')) ?? {}
  } catch {
    return {}
  }
})()
const initialTheme = [remembered.theme, settings?.theme].find((t) => SEASONS.includes(t)) ?? SITE_THEME
const initialUiStyle = [remembered.uiStyle, settings?.uiStyle].find((s) => UI_STYLES.includes(s)) ?? SITE_UI_STYLE
document.body.classList.add(initialTheme)
document.body.classList.add(`style-${initialUiStyle}`)
applyFonts(remembered)
// A first visit has no remembered look, only the build's snapshot, which is
// stale once the owner changes season or style: it painted that and then
// switched. Wait for the console's Settings instead (the same request App
// uses), at most 1.5 s, so a slow or unreachable console still shows the page.
const reveal = () => document.documentElement.classList.add('visible')
if (remembered.theme) reveal()
else {
  const fallback = setTimeout(reveal, 1500)
  fetchPublished('settings').then((docs) => {
    const live = docs?.[0]?.data
    if (live) {
      applyTheme(live.theme)
      applyUiStyle(live.uiStyle)
      applyFonts(live)
    }
    clearTimeout(fallback)
    reveal()
  })
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
