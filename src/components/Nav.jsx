import { useState } from 'react'
import styles from './Nav.module.css'
import Hamburger from './Hamburger' // Import the fixed component

function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>SpiritSeeds Wellness</h1>

        {/* Single button controlling the menu */}
        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <Hamburger isOpen={isOpen} />
        </button>
      </div>
    </nav>
  )
}

export default Nav
