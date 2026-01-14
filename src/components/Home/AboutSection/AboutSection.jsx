import React from 'react'
import { Link } from 'react-router-dom'
import '@/styles/components.css'
import melissaImage from '@/assets/SpiritSeedsLogo.jpg'

const AboutSection = () => {
  return (
    // Add "reverse" here when you want image on the RIGHT and text on the LEFT
    // Remove "reverse" when you want image on the LEFT and text on the RIGHT
    <section className="section-container reverse">
      <div className="media">
        <img src={melissaImage} alt="Melissa Carey" />
      </div>

      <div className="card">
        <h2>About</h2>
        <p>
          Spirit Seeds Wellness, located in Lafayette, Colorado, provides
          holistic healing for individuals healing CPTSD and seeking relief from
          emotional, physical, and spiritual pain. Through a combination of
          trauma-informed massage therapy, Thai Massage, sound healing singing
          bowls, Ayurveda, and yin yoga, Melissa Carey offers rituals that
          address multiple layers of health and well-being. To learn more about
          Melissa, click the button below.
        </p>

        <div className="button-row">
          <Link to="/about" className="btn">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
