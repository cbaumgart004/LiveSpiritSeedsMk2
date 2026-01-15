import React from 'react'
import { Link } from 'react-router-dom'
import '@/styles/components.css'
import '@/styles/layout.css'
import '@/styles/animations.css'
import './ServicesSection.css' // local layout + grid tweaks

const ServicesSection = () => {
  const services = [
    {
      title: 'Integrative Healing',
      description: 'Rejuvenate body and mind with relaxing touch.',
    },
    {
      title: 'Sound Healing',
      description: 'Align your energy with sacred sound frequencies.',
    },
    {
      title: 'Private Yoga Sessions',
      description: 'Build strength and serenity through movement.',
    },
    {
      title: 'Live Yoga Classes',
      description: 'Join a local class and practice with us.',
    },
    {
      title: 'Practice Online',
      description: 'Practice at your own pace with these online tools.',
    },
    {
      title: 'Follow Us on Social Media',
      description: 'Stay connected and inspired with our community.',
    },
  ]

  return (
    <section className="section-container">
      <h2>Our Services</h2>

      <div className="serviceGrid">
        {services.map((s, i) => (
          <div className="card shimmer-on-load" key={i}>
            <h3>{s.title}</h3>
            <p>{s.description}</p>

            <div className="button-row">
              <Link to="/services" className="btn">
                Learn More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
