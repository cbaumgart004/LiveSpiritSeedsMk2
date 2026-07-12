import PropTypes from 'prop-types'
import './Hamburger.css'

function Hamburger({ isOpen, toggleMenu }) {
  return (
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
  )
}

Hamburger.propTypes = {
  isOpen: PropTypes.bool,
  toggleMenu: PropTypes.func,
}

export default Hamburger
