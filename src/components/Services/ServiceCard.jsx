import React from 'react'
import styles from './ServiceCard.module.css'

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
            <a href="/" className={styles.learnMore}>
              Home
            </a>
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/AcZssZ0R6Tf5T_lgzGCqhsEHP9n-oeqicp35cuiakc4=?gv=true"
              className={styles.learnMore}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Now
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
