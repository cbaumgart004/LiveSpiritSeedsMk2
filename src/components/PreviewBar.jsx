/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import styles from './PreviewBar.module.css'
import { applyTheme, applyUiStyle, UI_STYLES, SEASONS } from '../cms/site'
import { savePreview, clearPreview } from '../utils/preview'

// A tap-friendly toolbar for previewing a UI style + season on the live content
// without saving to the CMS. Rendered only when Preview mode is active (see
// utils/preview.js) so ordinary visitors never see it.
const STYLE_LABELS = {
  watercolor: 'Original',
  editorial: 'Editorial',
  sanctuary: 'Sanctuary',
  immersive: 'Immersive',
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function PreviewBar({ initialStyle, initialSeason, onExit }) {
  const [style, setStyle] = useState(initialStyle || null)
  const [season, setSeason] = useState(initialSeason || null)

  // The saved defaults (initial*) arrive async from the CMS after this mounts.
  // Adopt them so the chips highlight the current look — but only while the
  // owner hasn't picked yet, so this never overrides their choice.
  useEffect(() => {
    if (initialStyle) setStyle((prev) => prev ?? initialStyle)
  }, [initialStyle])
  useEffect(() => {
    if (initialSeason) setSeason((prev) => prev ?? initialSeason)
  }, [initialSeason])

  const pickStyle = (value) => {
    setStyle(value)
    savePreview({ active: true, style: value, season })
    applyUiStyle(value)
  }
  const pickSeason = (value) => {
    setSeason(value)
    savePreview({ active: true, style, season: value })
    applyTheme(value)
  }
  const exit = () => {
    clearPreview()
    onExit?.()
  }

  return (
    <div className={styles.bar} role="region" aria-label="Style preview">
      <div className={styles.inner}>
        <span className={styles.badge}>Preview</span>

        <div className={styles.group}>
          <span className={styles.groupLabel}>Style</span>
          {UI_STYLES.map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.chip} ${style === value ? styles.active : ''}`}
              aria-pressed={style === value}
              onClick={() => pickStyle(value)}
            >
              {STYLE_LABELS[value] || value}
            </button>
          ))}
        </div>

        <div className={styles.group}>
          <span className={styles.groupLabel}>Season</span>
          {SEASONS.map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.chip} ${season === value ? styles.active : ''}`}
              aria-pressed={season === value}
              onClick={() => pickSeason(value)}
            >
              {cap(value)}
            </button>
          ))}
        </div>

        <span className={styles.note}>Not saved · set the default in Admin</span>
        <button type="button" className={styles.exit} onClick={exit}>
          Exit preview
        </button>
      </div>
    </div>
  )
}
