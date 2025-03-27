import React from 'react'
import './ServicesSection.css'

const ServicesSection = () => {
  const services = [
    {
      title: 'Massage Therapy',
      description: 'Rejuvenate body and mind with relaxing touch.',
    },
    {
      title: 'Sound Healing',
      description: 'Align your energy with sacred sound frequencies.',
    },
    {
      title: 'Yoga Classes',
      description: 'Build strength and serenity through movement.',
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
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
