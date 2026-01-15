// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SITE_THEME } from './config/siteConfig.js'

import './styles/variables.css'
import './styles/themes.css'
import './styles/index.css' // base element styles
import './styles/layout.css' // shared layout patterns
import './styles/components.css' // buttons/cards/etc
import './styles/animations.css' // keyframes/animation helpers

// Apply theme from config
document.body.classList.add(SITE_THEME)
document.documentElement.classList.add('visible')
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
