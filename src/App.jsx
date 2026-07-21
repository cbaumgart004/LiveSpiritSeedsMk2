import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DynamicPage from './pages/DynamicPage'
import ScrollToTop from './components/ScrollToTop'
import PreviewBar from './components/PreviewBar'
import { useEffect, useState } from 'react'
import { setupButtonClickFlash } from './utils/buttonFlashHandler'
import { loadSettings, applyTheme, applyUiStyle } from './cms/site'
import { initPreview, applyPreview } from './utils/preview'

function App() {
  // Non-destructive Preview mode (utils/preview.js): active only when opened via
  // ?preview / ?style / ?season. cms holds the saved defaults so exiting preview
  // can restore them without a reload.
  const [preview, setPreview] = useState(null)
  const [cms, setCms] = useState(null)

  useEffect(() => {
    setupButtonClickFlash()
    const active = initPreview(window.location.search)
    setPreview(active)
    // Season + UI style are owner-editable (Settings doc), overriding the
    // build-time defaults from main.jsx. A preview override (if any) is applied
    // last so it always wins over the saved defaults.
    loadSettings()
      .then((settings) => {
        setCms({ style: settings?.uiStyle, season: settings?.theme })
        applyTheme(settings?.theme)
        applyUiStyle(settings?.uiStyle)
      })
      .catch(() => {})
      .finally(() => applyPreview(active))
  }, [])

  const exitPreview = () => {
    // Restore the saved defaults (no reload) and hide the bar.
    applyTheme(cms?.season)
    applyUiStyle(cms?.style)
    setPreview(null)
    // Strip ?preview/?style/?season so a reload doesn't re-enter preview
    // (pathname is unchanged, so react-router stays in sync).
    window.history.replaceState({}, '', window.location.pathname)
  }

  return (
    <Router>
      <ScrollToTop /> {/* 💫 Always scroll to top on route change */}
      <Routes>
        <Route path="/" element={<DynamicPage />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Routes>
      {preview && (
        <PreviewBar
          initialStyle={preview.style || cms?.style}
          initialSeason={preview.season || cms?.season}
          onExit={exitPreview}
        />
      )}
    </Router>
  )
}

export default App
