// src/components/AboutSection/UpcomingEvents.jsx

import React from 'react'
import { Link } from 'react-router-dom'

import '@/styles/components.css'
import upcomingEventsImage from '@/assets/UpcomingEvents.jpg'

const UpcomingEvents = () => {
  return (
    <section className="section-container section-container-first">
      <div className="serviceContainer">
        <div className="about-image">
          <img src={upcomingEventsImage} alt="Melissa Carey" />
        </div>
        <div className="info-box">
          <h2>Check out What's New!</h2>
          <p>
            From live yoga classes and workshops to teacher trainings, retreats,
            and more — there's always something exciting on the horizon at
            Spirit Seeds. Tap below to explore our latest offerings and sign up.
          </p>
          <Link to="/upcoming" className="btn gradient-pulse flash">
            <span className="btn-content">View Events</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default UpcomingEvents
