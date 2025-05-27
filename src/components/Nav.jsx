import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' // 🧭 Import Link
import styles from './Nav.module.css'
import Hamburger from './Hamburger'

function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* 🌸 FIXED NAVBAR WITH CENTERED TITLE + BUTTON */}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navbarTopRow}>
          <h1 className={styles.title}>Spirit Seeds Wellness</h1>
          <div className={styles.hamburgerWrapper}>
            <Hamburger isOpen={isOpen} toggleMenu={toggleMenu} />
          </div>
        </div>
      </nav>

      {/* 🌿 FLOATING MENU DROPDOWN */}
      <div className={`${styles.menuOverlay} ${isOpen ? styles.show : ''}`}>
        <nav className={styles.menu}>
          <ul>
            <li>
              <Link to="/services" onClick={() => setIsOpen(false)}>
                Services
              </Link>
            </li>
            <li>
              <Link to="/" onClick={() => setIsOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link to="/" onClick={() => setIsOpen(false)}>
                Values
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Nav
