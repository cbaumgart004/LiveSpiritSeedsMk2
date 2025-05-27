import React from 'react'
import Nav from '../components/Nav'
import { ServiceCard } from '../components/Services'

import thaiImg from '../assets/services/thai.jpg'
import tuningForksImg from '../assets/services/tuningForks.jpg'
import compressImg from '../assets/services/compress.jpg'
import abhyangaImg from '../assets/services/abhyanga.jpg'
import chiNeSangImg from '../assets/services/chiNeSang.jpg'
import sessionsImg from '../assets/services/sessions.jpg'

const Services = () => {
  return (
    <>
      <Nav />
      <div className="page-wrapper">
        <ServiceCard
          title="Thai Yoga Bodywork"
          description="Thai Yoga is an ancient form of bodywork originating from India though widely practiced in Thailand. This form of bodywork resembles its yogic roots offering stretching, rocking, breathwork, and compression following the energy lines of the body much like Acupuncture.  Book a 90 Minutes session now.  $150"
          image={thaiImg}
          alt="Thai Yoga Bodywork"
          imagePosition="left"
        />

        <ServiceCard
          title="Integrative Healing Sessions"
          description="In this session Melissa will use tools from several modalities including Thai Yoga stretching, sound healing, passive Yin, reiki, and Abhyanga. We work intuitively to bring about wellness to the whole person, mind, body and spirit.  Book a 120 minute session now, $175, 90 minute session, $150, or a 75 minutes session, $120."
          image={tuningForksImg}
          alt="Integrative Healing with Sound and Movement"
          imagePosition="right"
        />

        <ServiceCard
          title="Abhyanga Ayurvedic Massage"
          description="Abhyanga is an Ayurvedic treatment focusing on balancing the energy of the body. We will do tongue and pulse diagnosis and mix a personal oil with essential oils, or infused oils for a full body treatment.  Book a 75 minute session now, $130."
          image={abhyangaImg}
          alt="Abhyanga Ayurvedic Massage with Herbal Oils"
          imagePosition="right"
        />

        <ServiceCard
          title="Private or Semi-Private Healing Yoga"
          description="Private or semi-private sessions where we can focus on creating a unique yoga and meditation routine to meet your specific needs. These sessions can include evidence and Neuroscience based practices to heal trauma, Ayurvedic lifestyle advice including diet, exercise and sleep coaching, Hatha based yogic practices, Yoga Nidra (Sleep Yoga), and Sound Therapy with Crystal and Tibetan Singing Bowls. Book a 90 minute session now, $150, or a 60 minute session, $150."
          image={sessionsImg}
          alt="Private Healing Yoga with Melissa"
          imagePosition="right"
        />
        <ServiceCard
          title="Chi Ne Sang Abdominal Detox"
          description="Abdominal detox bodywork based on Chinese meridian theory, works the fascia and pressure points of the belly to aid in full function of the organs and connective tissues of the back and spine.  Book a 75 minute session now, $130."
          image={chiNeSangImg}
          alt="Chi Ne Sang Abdominal Detox Therapy"
          imagePosition="left"
        />
        <ServiceCard
          title="Thai Herbal Compress"
          description="This add-on can be added to any session. Thai Herbal Compresses are balls of herbs wrapped in muslin and heated then applied to the body along acupressure points to promote healing.  If you would like to add a Thai Herbal Compress to your session, please let me know when you book.  $20"
          image={compressImg}
          alt="Warm Herbal Compress Therapy"
          imagePosition="left"
        />
      </div>
    </>
  )
}

export default Services
