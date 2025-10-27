import React from 'react'

import styles from './ServiceCard.module.css'
import '@/styles/components.css'
import '@/styles/animations.css'

const ServiceCard = ({ title, description, image, imagePosition = 'left' }) => {
  return (
    <section className={styles.serviceSection}>
      <div
        className={`${styles.serviceContainer} ${
          imagePosition === 'right' ? styles.reverse : ''
        }`}
      >
        <div className={styles.serviceImage}>
          <img src={image} alt={title} />
        </div>
        <div className={styles.serviceText}>
          <h2>{title}</h2>
          <p>{description}</p>
          <div className={styles.buttonRow}>
            <a href="/" className="btn">
              <span className="btn-content">Home</span>
            </a>
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/AcZssZ0R6Tf5T_lgzGCqhsEHP9n-oeqicp35cuiakc4=?gv=true"
              className="btn gradient-pulse flash"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-content">Book Now</span>
            </a>
            {''}
            {/* Will update link later */}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceCard
