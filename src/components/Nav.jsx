import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Nav.module.css'
import Hamburger from './Hamburger'
import { hrefForSlug, navLinks, useDocuments, useSettings } from '../cms/site'
import { useUiStyle } from '../utils/useUiStyle'
import { srcOf } from './cms/photo'

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
  // Menu links from the page list; the title and action button from Site Settings.
  const links = navLinks(useDocuments('page').docs)
  const { settings } = useSettings()
  const siteTitle = settings.siteTitle || 'Spirit Seeds Wellness'
  const cta = settings.navCtaLabel ? { label: settings.navCtaLabel, url: settings.navCtaUrl || '/' } : null
  const headerPhoto = srcOf(settings.headerImage)
  const uiStyle = useUiStyle()
  const showInlineMenu = INLINE_MENU_STYLES.includes(uiStyle)

  const toggleMenu = () => setIsOpen((open) => !open)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* The whole header opens Site settings: its title, action button and
          photo. The photo is the owner's if she set one (settings.headerImage),
          else the season's own (themes.css, --navbar-background). */}
      <nav
        className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
        data-nav-variant={uiStyle}
        data-eotm-edit="settings:settings"
        data-eotm-label="header"
        style={headerPhoto ? { '--navbar-background': `url("${headerPhoto}")` } : undefined}
      >
        <div className={styles.navbarTopRow}>
          <h1 className={styles.title} data-eotm-edit="settings:settings" data-eotm-label="site settings" data-eotm-text="siteTitle">{siteTitle}</h1>

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
