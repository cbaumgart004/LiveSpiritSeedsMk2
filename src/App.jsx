import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import ScrollToTop from './components/ScrollToTop'
// import About, Contact, etc as you build them

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* 💫 Always scroll to top on route change */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} /> {/* ⬅️ Add this line */}
        {/* Add other pages here */}
      </Routes>
    </Router>
  )
}

export default App
