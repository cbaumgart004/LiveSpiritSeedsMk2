import { useEffect } from 'react'
import Nav from './components/Nav'

import AboutSection from './components/AboutSection/AboutSection'
import ServicesSection from './components/ServicesSection/ServicesSection'
import ValuesSection from './components/ValuesSection/ValuesSection'

function App() {
  useEffect(() => {
    const season = 'summer' // change to 'summer', 'fall', 'winter' as needed
    document.body.classList.add(season)

    return () => {
      document.body.classList.remove(season)
    }
  }, [])

  return (
    <>
      <Nav />

      <AboutSection />
      <ServicesSection />
      <ValuesSection />
    </>
  )
}

export default App
