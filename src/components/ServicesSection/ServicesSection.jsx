import React from 'react'
import { Link } from 'react-router-dom'
import './ServicesSection.css'

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
    <section className="services-section">
      <h2>Our Services</h2>
      <div className="services-grid">
        {services.map((s, i) => (
          <div className="service-card" key={i}>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <Link to="/services" className="learn-more">
              Learn More
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
