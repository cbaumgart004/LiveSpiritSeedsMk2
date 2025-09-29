//src/pages/Home.jsx

import React from 'react'
import Nav from '@/components/Nav'
import UpcomingEventsSection from '@/components/Home/UpcomingEvents'
import AboutSection from '@/components/Home/AboutSection/AboutSection.jsx'
import ServicesSection from '@/components/ServicesSection/ServicesSection'
import ValuesSection from '@/components/ValuesSection/ValuesSection'

const Home = () => {
  return (
    <>
      <Nav />
      <UpcomingEventsSection />
      <ServicesSection />
      <AboutSection />

      <ValuesSection />
    </>
  )
}

export default Home
