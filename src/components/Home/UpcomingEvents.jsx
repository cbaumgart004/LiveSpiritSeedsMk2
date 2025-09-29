//src/components/AboutSection/AboutSection.jsx

import React from 'react'

import { Link } from 'react-router-dom'

import '@/styles/components.css'
import upcomingEventsImage from '@/assets/UpcomingEvents.jpg' // Adjust the path as needed

const UpcomingEvents = () => {
  return (
    <section className="section-container section-container-first">
      <div className="about-image">
        <img src={upcomingEventsImage} alt="Melissa Carey" />
      </div>
      <div className="info-box">
        <h2>Check out What's New!</h2>
        <p>
          From Live Yoga Classes to workshops, teacher trainings, retreats, and
          more, there's always something new coming up. Click here to learn
          more.
        </p>
        <Link to="/upcoming" className="btn">
          Learn More
        </Link>
      </div>
    </section>
  )
}

export default UpcomingEvents
