import { Fragment } from 'react'
import PropTypes from 'prop-types'
import styles from './ValuesSection.module.css'

// The values as the page's footer: the heading and the words in one small
// line, blossoms between them. `footer` is the global hook; the look is the
// module's (ADR 0001). The heading and each word can be typed on the page
// while the editor is open (data-eotm-text; a word names its row).
const ValuesSection = ({ title = 'Our Core Values', words = [{ text: 'Growth' }, { text: 'Acceptance' }, { text: 'Service' }] }) => {
  return (
    <footer className={`section footer ${styles.footer}`}>
      <h2 className={styles.title} data-eotm-text="title">{title}</h2>
      <div className={styles.inlineList}>
        {words.map((word, i) => (
          <Fragment key={word._id ?? i}>
            {i > 0 && <span className={styles.blossom} aria-hidden="true" />}
            <span className={styles.word} data-eotm-text={word._id ? 'text' : undefined} data-eotm-in={word._id}>{word.text}</span>
          </Fragment>
        ))}
      </div>
    </footer>
  )
}

ValuesSection.propTypes = {
  title: PropTypes.string,
  words: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string, text: PropTypes.string })),
}

export default ValuesSection
