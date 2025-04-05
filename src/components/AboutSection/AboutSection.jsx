import React, { useEffect, useState } from 'react'

import './AboutSection.css'

const AboutSection = () => {
  const [offsetY, setOffsetY] = useState(0)

  const handleScroll = () => {
    setOffsetY(window.scrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const translateY = 100 - offsetY * 0.2

  return (
    <section className="about-section">
      <div
        className="parallax-content"
        style={{
          transform: `translateY(${Math.max(0, translateY)}px)`,
          opacity: Math.min(1, 1 - offsetY * 0.0015),
        }}
      >
        <h2>About SpiritSeeds Wellness</h2>
        <p>
          Spirit Seeds Wellness blends traditional healing with modern
          mindfulness. We create a safe space for transformation, rooted in
          compassion and presence.
        </p>
      </div>
    </section>
  )
}

export default AboutSection
