import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Nav.module.css'
import Hamburger from './Hamburger'
import { loadSettings, loadPages, hrefForSlug } from '../cms/site'

function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [links, setLinks] = useState([])
  const [siteTitle, setSiteTitle] = useState('Spirit Seeds Wellness')

  const toggleMenu = () => setIsOpen((open) => !open)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Nav links come from the CMS page list; the title from Site Settings.
    loadPages()
      .then(setLinks)
      .catch(() => {})
    loadSettings()
      .then((settings) => settings?.siteTitle && setSiteTitle(settings.siteTitle))
      .catch(() => {})
  }, [])

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navbarTopRow}>
          <h1 className={styles.title}>{siteTitle}</h1>

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
