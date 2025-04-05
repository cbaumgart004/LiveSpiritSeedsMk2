import './Hamburger.css'

function Hamburger({ isOpen, toggleMenu }) {
  return (
    <>
      {/* Hamburger Button */}
      <div
        className={`hamburger ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Dropdown Menu */}
      <div className={`menu-overlay ${isOpen ? 'show' : ''}`}>
        <nav className="menu">
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

export default Hamburger
