// Reads the active UI style off <body> and re-reads it whenever that class
// changes.
//
// The style is applied as a `style-<x>` body class from three places — the
// build-time bake in main.jsx, the CMS load in App.jsx, and Preview mode — so
// <body> is the single source of truth. Watching it (rather than loading
// Settings) means a component restyles instantly when the owner flips a chip in
// the preview bar, without a reload and without Preview writing to the CMS.
//
// Used by Nav.jsx, which changes its DOM (not just its CSS) per style.
import { useEffect, useState } from 'react'
import { UI_STYLES } from '../cms/site'

const FALLBACK = 'watercolor'

function readUiStyle() {
  if (typeof document === 'undefined') return FALLBACK
  return UI_STYLES.find((s) => document.body.classList.contains(`style-${s}`)) || FALLBACK
}

export function useUiStyle() {
  const [uiStyle, setUiStyle] = useState(readUiStyle)

  useEffect(() => {
    // Re-read once on mount: main.jsx/App.jsx may have applied the class between
    // the initial useState call and this effect.
    setUiStyle(readUiStyle())
    const observer = new MutationObserver(() => setUiStyle(readUiStyle()))
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return uiStyle
}
