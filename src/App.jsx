import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import DynamicPage from './pages/DynamicPage'
import ScrollToTop from './components/ScrollToTop'
import PreviewBar from './components/PreviewBar'
import { useEffect, useState } from 'react'
import { setupButtonClickFlash } from './utils/buttonFlashHandler'
import { applyTheme, applyUiStyle, rememberLook, useSettings, CONSOLE_API } from './cms/site'
import { initPreview, applyPreview } from './utils/preview'

// The Edge of the Map console asks for a page by dispatching 'eotm:navigate'
// (opening a document shows its page); taking it through the router keeps the
// console open instead of reloading the site under it.
function ConsoleNavigation() {
  const navigate = useNavigate()
  useEffect(() => {
    const onNavigate = (e) => {
      e.preventDefault()
      navigate(e.detail.path === '/home' ? '/' : e.detail.path)
    }
    window.addEventListener('eotm:navigate', onNavigate)
    return () => window.removeEventListener('eotm:navigate', onNavigate)
  }, [navigate])
  return null
}

// The owner's way in: /preview signs her in through the console and brings her
// back to the home page with the editor open, as StoryShaped's /preview does.
// The address she came from goes along, so a preview returns to the preview.
function ToEditor() {
  useEffect(() => {
    const back = encodeURIComponent('/')
    location.replace(`${new URL(CONSOLE_API).origin}/?handoff=spiritseeds&return=${back}&origin=${encodeURIComponent(location.origin)}`)
  }, [])
  return <p style={{ padding: '2rem', textAlign: 'center' }}>Opening the editor…</p>
}

function App() {
  // Non-destructive Preview mode (utils/preview.js): active only when opened via
  // ?preview / ?style / ?season. The saved defaults come from Settings, so
  // exiting preview can restore them without a reload.
  const [preview, setPreview] = useState(null)
  const { ready, settings } = useSettings()

  useEffect(() => {
    setupButtonClickFlash()
    setPreview(initPreview(window.location.search))
  }, [])

  // Season + UI style are owner-editable (Settings), overriding the build-time
  // defaults from main.jsx, and follow the owner's draft live while editing. A
  // preview override (if any) is applied last so it always wins.
  useEffect(() => {
    if (!ready) return
    applyTheme(settings.theme)
    applyUiStyle(settings.uiStyle)
    rememberLook(settings.theme, settings.uiStyle)
    if (preview) applyPreview(preview)
  }, [ready, settings.theme, settings.uiStyle, preview])

  const exitPreview = () => {
    // Restore the saved defaults (no reload) and hide the bar.
    applyTheme(settings.theme)
    applyUiStyle(settings.uiStyle)
    setPreview(null)
    // Strip ?preview/?style/?season so a reload doesn't re-enter preview
    // (pathname is unchanged, so react-router stays in sync).
    window.history.replaceState({}, '', window.location.pathname)
  }

  return (
    <Router>
      <ScrollToTop /> {/* 💫 Always scroll to top on route change */}
      <ConsoleNavigation />
      <Routes>
        <Route path="/preview" element={<ToEditor />} />
        <Route path="/" element={<DynamicPage />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Routes>
      {preview && (
        <PreviewBar
          initialStyle={preview.style || settings.uiStyle}
          initialSeason={preview.season || settings.theme}
          onExit={exitPreview}
        />
      )}
    </Router>
  )
}

export default App
