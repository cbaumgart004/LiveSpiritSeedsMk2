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
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <h1 className={styles.title}>SpiritSeeds Wellness</h1>
      </nav>

      {/* HAMBURGER OUTSIDE NAVBAR */}
      <div className={styles.hamburgerOuter}>
        <div className={styles.hamburgerWrapper}>
          <Hamburger isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>
      </div>
    </>
  )
}

export default Nav
