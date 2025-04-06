import React from 'react'

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
            <button className="learn-more">Learn More</button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
