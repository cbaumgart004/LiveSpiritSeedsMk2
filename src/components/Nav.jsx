import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Nav.module.css'
import Hamburger from './Hamburger'
import { loadSettings, loadPages, hrefForSlug } from '../cms/site'
import { useUiStyle } from '../utils/useUiStyle'

// The navbar's SHAPE is per UI style, not just its paint (DESIGN.md §6):
//   watercolor — the untouched original: framed title box + hamburger only.
//   editorial  — title left, inline menu right, transparent over the splash.
//   sanctuary  — title left, inline menu, and a filled action button.
//   immersive  — title centered with the inline menu stacked beneath it.
// Everything but watercolor renders the page links inline on desktop and falls
// back to the hamburger overlay on mobile. `data-nav-variant` is the hook the
// global stylesheet targets — the class names here are CSS-module-scoped and so
// unreachable from ui-styles.css (ADR 0001: modules own component-unique styles,
// the global layer must not redefine them).
const INLINE_MENU_STYLES = ['editorial', 'sanctuary', 'immersive']

function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [links, setLinks] = useState([])
  const [siteTitle, setSiteTitle] = useState('Spirit Seeds Wellness')
  const [cta, setCta] = useState(null)
  const uiStyle = useUiStyle()
  const showInlineMenu = INLINE_MENU_STYLES.includes(uiStyle)

  const toggleMenu = () => setIsOpen((open) => !open)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Nav links come from the CMS page list; the title + action button from Site Settings.
    loadPages()
      .then(setLinks)
      .catch(() => {})
    loadSettings()
      .then((settings) => {
        if (settings?.siteTitle) setSiteTitle(settings.siteTitle)
        if (settings?.navCtaLabel) {
          setCta({ label: settings.navCtaLabel, url: settings.navCtaUrl || '/' })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <nav
        className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
        data-nav-variant={uiStyle}
      >
        <div className={styles.navbarTopRow}>
          <h1 className={styles.title}>{siteTitle}</h1>

          {showInlineMenu && (
            <ul className={styles.inlineMenu}>
              {links.map((link) => (
                <li key={link.slug}>
                  <Link to={hrefForSlug(link.slug)}>{link.label}</Link>
                </li>
              ))}
            </ul>
          )}

          {showInlineMenu && cta && (
            <a className={styles.navCta} href={cta.url}>
              {cta.label}
            </a>
          )}

          <div className={styles.hamburgerWrapper}>
            <Hamburger isOpen={isOpen} toggleMenu={toggleMenu} />
          </div>
        </div>
      </nav>

      <div className={`${styles.menuOverlay} ${isOpen ? styles.show : ''}`}>
        <nav className={styles.menu}>
          <ul>
            {links.map((link) => (
              <li key={link.slug}>
                <Link to={hrefForSlug(link.slug)} onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Nav
