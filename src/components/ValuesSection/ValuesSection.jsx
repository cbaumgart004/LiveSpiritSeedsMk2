import styles from './ValuesSection.module.css'

const ValuesSection = () => {
  return (
    <section className={`section section--stack ${styles.band}`}>
      <h2 className={styles.title}>Our Core Values</h2>
      <div className={styles.inlineList}>
        <span className={styles.word}>Growth</span>
        <span className={styles.blossom} />
        <span className={styles.word}>Acceptance</span>
        <span className={styles.blossom} />
        <span className={styles.word}>Service</span>
      </div>
    </section>
  )
}

export default ValuesSection
