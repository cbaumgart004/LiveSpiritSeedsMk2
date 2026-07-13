import { Fragment } from 'react'
import PropTypes from 'prop-types'
import styles from './ValuesSection.module.css'

const ValuesSection = ({
  title = 'Our Core Values',
  words = ['Growth', 'Acceptance', 'Service'],
}) => {
  return (
    <section className={`section section--stack ${styles.band}`}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.inlineList}>
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && <span className={styles.blossom} />}
            <span className={styles.word}>{word}</span>
          </Fragment>
        ))}
      </div>
    </section>
  )
}

ValuesSection.propTypes = {
  title: PropTypes.string,
  words: PropTypes.arrayOf(PropTypes.string),
}

export default ValuesSection
