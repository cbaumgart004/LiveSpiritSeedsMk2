import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DynamicPage from './pages/DynamicPage'
import ScrollToTop from './components/ScrollToTop'
import { useEffect } from 'react'
import { setupButtonClickFlash } from './utils/buttonFlashHandler'
import { loadSettings, applyTheme } from './cms/site'

function App() {
  useEffect(() => {
    setupButtonClickFlash()
    // Seasonal theme is now owner-editable (Settings doc), overriding the
    // build-time default applied in main.jsx.
    loadSettings()
      .then((settings) => applyTheme(settings?.theme))
      .catch(() => {})
  }, [])

  return (
    <Router>
      <ScrollToTop /> {/* 💫 Always scroll to top on route change */}
      <Routes>
        <Route path="/" element={<DynamicPage />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Routes>
    </Router>
  )
}

export default App
