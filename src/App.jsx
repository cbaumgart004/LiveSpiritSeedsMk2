import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import Upcoming from './pages/Upcoming'
import ScrollToTop from './components/ScrollToTop'
import { useEffect } from 'react'
import { setupButtonClickFlash } from './utils/buttonFlashHandler'

// import About, Contact, etc as you build them

function App() {
  useEffect(() => {
    setupButtonClickFlash()
  }, [])

  return (
    <Router>
      <ScrollToTop /> {/* 💫 Always scroll to top on route change */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} /> {/* ⬅️ Add this line */}
        <Route path="/upcoming" element={<Upcoming />} />{' '}
        {/* ⬅️ Add this line */}
        {/* Add other pages here */}
      </Routes>
    </Router>
  )
}

export default App
