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
        <h2>About Melissa Carey</h2>
        <p>Click here to learn more about Melissa Carey.</p>
        <button className="learn-more">Learn More</button>
      </div>
    </section>
  )
}

export default AboutSection
