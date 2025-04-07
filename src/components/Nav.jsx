import { useState } from 'react'
import styles from './Nav.module.css'
import Hamburger from './Hamburger'

function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* 🌸 FIXED NAVBAR WITH CENTERED TITLE + BUTTON */}
      <nav className={styles.navbar}>
        <div className={styles.navbarTopRow}>
          <h1 className={styles.title}>SpiritSeeds Wellness</h1>
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
              <a href="#">Services</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Values</a>
            </li>
            <li>
              <a href="#">Store</a>
            </li>
            <li>
              <a href="#">Signup</a>
            </li>
            <li>
              <a href="#">Login</a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Nav
