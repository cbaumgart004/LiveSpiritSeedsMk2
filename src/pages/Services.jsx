// src/pages/Services.jsx

import React from 'react'
import Nav from '../components/Nav'
import { ServiceCard } from '../components/Services'
import { THAI_COMPRESS_AVAILABLE } from '../config/siteConfig.js'

import thaiImg from '../assets/services/thai.jpg'
import tuningForksImg from '../assets/services/tuningForks.jpg'
import compressImg from '../assets/services/compress.jpg'
import abhyangaImg from '../assets/services/abhyanga.jpg'
import chiNeSangImg from '../assets/services/chiNeSang.jpg'
import sessionsImg from '../assets/services/sessions.jpg'

// helper: build the secondary section for add-on
const makeThaiCompressSecondary = (url) =>
  THAI_COMPRESS_AVAILABLE
    ? {
        url,
        label: 'Book w/ Thai Compress',
      }
    : {
        comingSoon: true,
        label: 'Thai Compress Coming Soon',
      }

const Services = () => {
  return (
    <>
      <Nav />
      <div className="page-wrapper">
        <ServiceCard
          title={
            THAI_COMPRESS_AVAILABLE
              ? 'Thai Herbal Compress'
              : 'Thai Herbal Compress (Coming Soon)'
          }
          description={
            THAI_COMPRESS_AVAILABLE
              ? 'Thai Herbal Compresses are warmed herbal bundles applied along acupressure points to promote deep relaxation and healing. This service can be added to select sessions. Please mention it when you book.'
              : 'Thai Herbal Compresses are warmed herbal bundles applied along acupressure points to promote deep relaxation and healing. This additional service can be added to select sessions once we replenish supplies.  Please let us know if this is a service you are interested in for future sessions.'
          }
          image={compressImg}
          alt="Thai Herbal Compress"
          imagePosition="left"
        />
        <ServiceCard
          title="Integrative Massage Sessions"
          description="In this session Melissa will use tools from several modalities including Thai Yoga stretching, sound healing, passive Yin, reiki, and Abhyanga. We work intuitively to bring about wellness to the whole person, mind, body and spirit."
          image={tuningForksImg}
          alt="Integrative Healing with Sound and Movement"
          imagePosition="right"
          bookingOptions={[
            {
              label: '120 minute session — $190',
              primary: {
                label: 'Book Session',
                url: 'https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=5bc90e8e-46b8-4897-b015-2b6904eedba3',
              },
              secondary: makeThaiCompressSecondary(
                'https://.../integrative-120-compress'
              ),
            },
            {
              label: '90 minute session — $150',
              primary: {
                label: 'Book Session',
                url: 'https://.../integrative-90',
              },
              secondary: makeThaiCompressSecondary(
                'https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=2ed2f36c-e141-4ec3-a4c8-90b361024f27'
              ),
            },
            {
              label: '75 minute session — $120*',
              primary: {
                label: 'Book Session',
                url: 'https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=1dc621b5-8453-4957-9588-ca55b7dd59c3',
              },
              secondary: makeThaiCompressSecondary(
                'https://.../integrative-75-compress'
              ),
              note: '*Sliding scale and pay-it-forward options are available for this session to support accessibility and sustainability for the practice.',
            },
          ]}
        />
        <ServiceCard
          title="Thai Yoga Massage"
          description="Thai Yoga is an ancient form of massage originating from India though widely practiced in Thailand. This form of massage resembles its yogic roots offering stretching, rocking, breathwork, and compression following the energy lines of the body much like Acupuncture.  Book a 90 Minutes session now.  $150"
          image={thaiImg}
          alt="Thai Yoga Bodywork"
          imagePosition="left"
          bookingOptions={[
            {
              label: '120 minute session — $190',
              primary: {
                label: 'Book Session',
                url: 'https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=9c830558-2ad3-4693-ba03-0ac46ec40d20',
              },
              secondary: makeThaiCompressSecondary(
                'https://.../integrative-120-compress'
              ),
            },
            {
              label: '90 minute session — $150',
              primary: {
                label: 'Book Session',
                url: 'https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=4b19da91-fe8a-472e-a5e4-d5b49b799ac5',
              },
              secondary: makeThaiCompressSecondary(
                'https://.../integrative-90-compress'
              ),
            },
            {
              label: '75 minute session — $120',
              primary: {
                label: 'Book Session',
                url: 'https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=419340ab-825e-4c28-9c78-778a7281acc4',
              },
              secondary: makeThaiCompressSecondary(
                'https://.../integrative-75-compress'
              ),
            },
          ]}
        />

        <ServiceCard
          title="Abhyanga Ayurvedic Massage"
          description="Abhyanga is an Ayurvedic treatment focusing on balancing the energy of the body. We will do tongue and pulse diagnosis and mix a personal oil with essential oils, or infused oils for a full body treatment.  Book a 75 minute session now, $130."
          image={abhyangaImg}
          alt="Abhyanga Ayurvedic Massage with Herbal Oils"
          imagePosition="right"
          bookingUrl="https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=feeb171c-d05d-4d2c-a93a-65d3a8b29a27" // placeholder
        />

        <ServiceCard
          title="Private or Semi-Private Healing Yoga"
          description="Private or semi-private sessions where we can focus on creating a unique yoga and meditation routine to meet your specific needs. These sessions can include evidence and Neuroscience based practices to heal trauma, Ayurvedic lifestyle advice including diet, exercise and sleep coaching, Hatha based yogic practices, Yoga Nidra (Sleep Yoga), and Sound Therapy with Crystal and Tibetan Singing Bowls. Book a 90 minute session now, $150, or a 60 minute session, $150."
          image={sessionsImg}
          alt="Private Healing Yoga with Melissa"
          imagePosition="right"
          bookingUrl="https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=971137ca-f438-40ef-9b18-cd8809658b58" // placeholder
        />

        <ServiceCard
          title="Chi Ne Sang Abdominal Detox"
          description="Abdominal detox bodywork based on Chinese meridian theory, works the fascia and pressure points of the belly to aid in full function of the organs and connective tissues of the back and spine.  Book a 75 minute session now, $130."
          image={chiNeSangImg}
          alt="Chi Ne Sang Abdominal Detox Therapy"
          imagePosition="left"
          bookingUrl="https://spiritseedswellnessmelissacarey.offeringtree.com/offerings/book?offering=e591f6db-4672-4eda-8b21-38e05ec1d48b" // placeholder
        />
      </div>
    </>
  )
}

export default Services
