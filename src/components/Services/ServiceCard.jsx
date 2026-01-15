import React from 'react'
import PropTypes from 'prop-types'
import styles from './ServiceCard.module.css'
import '@/styles/components.css'
import '@/styles/layout.css'
import '@/styles/animations.css'
const ServiceCard = ({
  title,
  description,
  image,
  alt,
  imagePosition = 'left',

  // simple mode: one booking button
  bookingUrl,
  bookingLabel = 'Book Now',

  // advanced mode: multiple rows with primary/secondary buttons
  bookingOptions = [],

  // global coming-soon for the *whole* service card
  comingSoon = false,
  comingSoonLabel = 'Coming Soon',
}) => {
  const hasMultipleOptions = bookingOptions && bookingOptions.length > 0

  return (
    <section className={styles.serviceSection}>
      <div
        className={`${styles.serviceContainer} ${
          imagePosition === 'right' ? styles.reverse : ''
        }`}
      >
        <div className={styles.serviceImage}>
          <img src={image} alt={alt || title} />
        </div>

        <div className={styles.serviceText}>
          <h2>{title}</h2>
          <p>{description}</p>

          <div className={styles.buttonRow}>
            {comingSoon && (
              <div className={styles.comingSoonBadge}>{comingSoonLabel}</div>
            )}

            {/* 🧾 Multi-row booking layout (only if card itself is NOT coming soon) */}
            {!comingSoon && hasMultipleOptions && (
              <div className={styles.bookingOptions}>
                {bookingOptions.map((option, idx) => (
                  <div key={idx} className={styles.bookingRow}>
                    <span className={styles.bookingInfo}>{option.label}</span>

                    <div className={styles.bookingButtons}>
                      {/* primary = main session booking */}
                      {option.primary && option.primary.url && (
                        <a
                          href={option.primary.url}
                          className="btn gradient-pulse flash"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="btn-content">
                            {option.primary.label || 'Book Session'}
                          </span>
                        </a>
                      )}

                      {option.secondary && (
                        <a
                          href={
                            option.secondary.comingSoon
                              ? undefined
                              : option.secondary.url
                          }
                          className={`btn ${
                            option.secondary.comingSoon
                              ? styles.disabledBtn
                              : ''
                          }`}
                          onClick={(e) => {
                            if (option.secondary.comingSoon) e.preventDefault()
                          }}
                        >
                          <span className="btn-content">
                            {option.secondary.comingSoon
                              ? option.secondary.label || 'Coming Soon'
                              : option.secondary.label || 'Book w/ Add-On'}
                          </span>
                        </a>
                      )}
                    </div>

                    {/* ✅ OPTIONAL NOTE (spans both buttons) */}
                    {option.note && (
                      <div className={styles.bookingNote}>{option.note}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 🎯 Single booking button (simple services, only if not coming soon) */}
            {!comingSoon && !hasMultipleOptions && bookingUrl && (
              <a
                href={bookingUrl}
                className="btn gradient-pulse flash"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="btn-content">{bookingLabel}</span>
              </a>
            )}

            {/* 🏠 Home button – always visible */}
            <a href="/" className="btn">
              <span className="btn-content">Home</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

ServiceCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  alt: PropTypes.string,
  imagePosition: PropTypes.oneOf(['left', 'right']),

  bookingUrl: PropTypes.string,
  bookingLabel: PropTypes.string,

  bookingOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      primary: PropTypes.shape({
        label: PropTypes.string,
        url: PropTypes.string,
      }),
      secondary: PropTypes.shape({
        label: PropTypes.string,
        url: PropTypes.string,
        comingSoon: PropTypes.bool,
      }),
      note: PropTypes.string, // ✅ new
    })
  ),

  comingSoon: PropTypes.bool,
  comingSoonLabel: PropTypes.string,
}

export default ServiceCard
