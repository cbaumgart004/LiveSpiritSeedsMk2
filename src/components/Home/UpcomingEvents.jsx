import React from 'react'
import { Link } from 'react-router-dom'

import upcomingEventsImage from '@/assets/UpcomingEvents.jpg'

const UpcomingEvents = () => {
  return (
    // Add "reverse" when you want image on the RIGHT, text on the LEFT
    <section className="section-container first-section reverse">
      {/* Image column */}
      <div className="media">
        <img src={upcomingEventsImage} alt="Upcoming Events" />
      </div>

      {/* Text column */}
      <div className="card">
        <h2>Check Out What's New!</h2>
        <p>
          From live yoga classes and workshops to teacher trainings, retreats,
          and more — there's always something exciting on the horizon at Spirit
          Seeds. Tap below to explore our latest offerings and sign up.
        </p>

        <div className="button-row">
          <Link to="/upcoming" className="btn">
            View Events
          </Link>
        </div>
      </div>
    </section>
  )
}

export default UpcomingEvents
