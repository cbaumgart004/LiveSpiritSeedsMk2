import React from 'react'
import './ValuesSection.css'

const ValuesSection = () => {
  return (
    <section className="values-section">
      <h2 className="values-title">Our Core Values</h2>
      <div className="values-inline-list">
        <span className="value-word">Growth</span>
        <span className="value-blossom" />
        <span className="value-word">Acceptance</span>
        <span className="value-blossom" />
        <span className="value-word">Service</span>
      </div>
    </section>
  )
}

export default ValuesSection
