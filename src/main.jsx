// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SITE_THEME } from './config/siteConfig.js'
// Content is git-backed and static, so the current theme is known at build time.
// Importing it here bakes the correct season into the first paint — no
// spring→summer flash while the CMS Settings doc loads async in App.
import settings from '../content/settings/index.json'

import './styles/variables.css'
import './styles/themes.css'
import './styles/index.css' // base element styles
import './styles/layout.css' // shared layout patterns
import './styles/components.css' // buttons/cards/etc
import './styles/animations.css' // keyframes/animation helpers

// Apply the real theme before render (SITE_THEME is only a fallback for a
// missing/invalid Settings value). App re-applies the same value on load.
const SEASONS = ['spring', 'summer', 'fall', 'winter']
const initialTheme = SEASONS.includes(settings?.theme) ? settings.theme : SITE_THEME
document.body.classList.add(initialTheme)
document.documentElement.classList.add('visible')
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
