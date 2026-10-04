import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Nav.module.css'
import Hamburger from './Hamburger'
import AccountButton from './AccountButton'
import { hrefForSlug, navLinks, useDocuments, useSettings } from '../cms/site'
import { useUiStyle } from '../utils/useUiStyle'
import { srcOf } from './cms/photo'
import { frameOf } from './cms/Frame'

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
  // The header is one arranged region of Site settings (_layout_header): its
  // account button, title, menu, action button and menu toggle are parts the
  // console's Arrange can place (cms/Frame.jsx).
  const frame = frameOf(settings, 'header')
  const { style: frameStyle, ...frameMarks } = frame.root

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
        data-eotm-field="headerImage"
        data-eotm-frame-key="header"
        {...frameMarks}
        style={headerPhoto || frameStyle ? { ...frameStyle, ...(headerPhoto ? { '--navbar-background': `url("${headerPhoto}")` } : {}) } : undefined}
      >
        <div className={styles.navbarTopRow} {...frame.wrap}>
          {/* The account button left of the title, mirroring the menu button
              on the right, so the bar is symmetrical. */}
          <div className={styles.accountWrapper} {...frame.part('account')}>
            <AccountButton />
          </div>

          <h1 className={styles.title} data-eotm-field="siteTitle" data-eotm-text="siteTitle" {...frame.part('title')}>{siteTitle}</h1>

          {showInlineMenu && (
            <ul className={styles.inlineMenu} {...frame.part('menu')}>
              {links.map((link) => (
                <li key={link.slug}>
                  <Link to={hrefForSlug(link.slug)}>{link.label}</Link>
                </li>
              ))}
            </ul>
          )}

          {showInlineMenu && cta && (
            <a className={styles.navCta} href={cta.url} data-eotm-field="navCtaLabel" {...frame.part('cta')}>
              <span data-eotm-text="navCtaLabel">{cta.label}</span>
            </a>
          )}

          {/* Desktop inline-menu styles hide both corners, so the account
              button sits at the end of the row there instead. */}
          {showInlineMenu && <AccountButton className={styles.inlineAccount} />}

          <div className={styles.hamburgerWrapper} {...frame.part('menuToggle')}>
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
