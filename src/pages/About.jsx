// src/pages/About.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import './AboutPage.css'
import melissaImage from '../assets/Warrior.jpg'

const About = () => {
  return (
    <>
      <Nav />
      <section className="about-section">
        <div className="about-container">
          <div className="about-image">
            <img src={melissaImage} alt="Melissa Carey" />
          </div>
          <div className="about-box">
            <h2>Meet Melissa Carey</h2>
            <p>
              Melissa Carey, the owner and founder of Spirit Seeds Wellness, is
              an intuitive healer and trauma informed yoga teacher. With over
              two decades of experience, she blends holistic wellness practices,
              including thai massage therapy and crystal bowls sound healing, to
              create transformative healing experiences. Offering an intuitive
              combination of sound bowl healing, yin yoga, and holistic healing
              massage, Melissa fiercely believes in the body's innate wisdom to
              heal, and her life’s work is to guide others toward wholeness,
              resilience, and growth.
            </p>
            <p>
              Holding a Bachelor's in Traditional Eastern Arts, Melissa studied
              Yoga, Religious Studies, Music, and Ayurveda at Naropa University,
              and exploring the best holistic healing centers with leading
              experts in trauma-informed yoga, partner yoga, and sound healing.
              An artist and musician, Melissa discovered the power of sound
              healing and acutonics in her journey toward healing and personal
              growth, introducing her to ancient healing modalities, including
              vocal toning, Indian raga, tibetan bowls, and mantra. Her passion
              for Thai massage, rooted in the yogic tradition, led her to study
              with teachers worldwide, refining her skills as a massage
              therapist and healer.
            </p>
            <p>
              Today, Melissa provides one-on-one trauma-informed massage therapy
              and facilitates group healing sessions, partnering with local
              organizations like Soul Tree Yoga and Movement to End Sexual
              Assault (MESA) to support those healing CPTSD and navigating grief
              work. As a sound healer, Melissa offers a yoga and sound bath
              practice at Soul Tree Yoga Lafayette, the premier trauma informed
              yoga studio in Boulder County.
            </p>

            {/* 🪄 Add these two buttons */}
            <div className="about-buttons">
              <a
                href="https://calendar.google.com/calendar/u/0/appointments/AcZssZ0R6Tf5T_lgzGCqhsEHP9n-oeqicp35cuiakc4=?gv=true"
                className="learn-more"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Service
              </a>

              <Link to="/" className="learn-more">
                Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
