import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import DynamicPage from './pages/DynamicPage'
import ConnectPage from './pages/ConnectPage'
import ClassStyles from './components/cms/ClassStyles'
import ScrollToTop from './components/ScrollToTop'
import { useEffect } from 'react'
import { setupButtonClickFlash } from './utils/buttonFlashHandler'
import { applyFonts, applyTheme, applyUiStyle, rememberLook, useSettings } from './cms/site'
import { openAccount } from './cms/account'
import AccountModal from './components/AccountModal'
import SignedIn from './components/SignedIn'
import ResetPassword from './pages/ResetPassword'

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

// An old bookmark to /preview: the home page with the sign-in window open,
// which is the one way into the editor.
function ToSignIn() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/', { replace: true })
    openAccount()
  }, [navigate])
  return null
}

function App() {
  const { ready, settings } = useSettings()

  useEffect(() => {
    setupButtonClickFlash()
  }, [])

  // Season + UI style are owner-editable (Settings), overriding the build-time
  // defaults from main.jsx, and follow the owner's draft live while editing, so
  // a season or style tried in the editor shows before it is published.
  useEffect(() => {
    if (!ready) return
    applyTheme(settings.theme)
    applyUiStyle(settings.uiStyle)
    applyFonts(settings)
    document.body.dataset.phonePadding = settings.phonePadding || 'tight'
    rememberLook(settings)
  }, [ready, settings])

  return (
    <Router>
      <ScrollToTop /> {/* 💫 Always scroll to top on route change */}
      <ConsoleNavigation />
      {/* The owner's Classes, as CSS rules (the console's Classes document). */}
      <ClassStyles />
      <Routes>
        <Route path="/preview" element={<ToSignIn />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<DynamicPage />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Routes>
      {/* Site-wide, under every page: the human-readable half of the AI-training
          reservation; the machine-readable half is index.html, the console's
          robots.txt (schema robots.blockTraining) and .well-known/tdmrep.json. */}
      <p className="ai-notice">
        No content on this site, including text, photographs and designs, may be used to train
        artificial intelligence or machine learning models.
      </p>
      <AccountModal />
      <SignedIn />
    </Router>
  )
}

export default App
