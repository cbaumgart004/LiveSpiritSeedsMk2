// src/pages/About.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import './UpcomingPage.css'
import Bali_1 from '../assets/upcomingEvents/bali/Bali_1.svg'
import Bali_2 from '../assets/upcomingEvents/bali/Bali_2.svg'
const Upcoming = () => {
  return (
    <>
      <Nav />
      <section className="section-container-first upcoming-section">
        <div className="upcoming-box info-box">
          <h2>2026 Bali Retreat!</h2>
          <div className="upcoming-image">
            <img src={Bali_1} alt="Bali Retreat About" />
          </div>
          <div className="upcoming-image">
            <img src={Bali_2} alt="Bali Retreat Details" />
          </div>
          <div className="upcoming-buttons">
            <a
              href="mailto:melissacarey@spiritseedswellness.com"
              className="btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="blue"
                viewBox="0 4 24 24"
                style={{ marginRight: '8px', verticalAlign: 'middle' }}
              >
                <path d="M2 4h20v16H2z" fill="none" />
                <path d="M22 6.01V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.01l10 5.99 10-5.99zm-10 4.48L4.5 6h15L12 10.49z" />
              </svg>
              Contact Melissa
            </a>
            <Link to="/" className="btn">
              Home
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Upcoming
