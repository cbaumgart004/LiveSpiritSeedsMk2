// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SITE_THEME } from './config/siteConfig.js'

// Global Styles
import './styles/variables.css'
import './styles/themes.css'
import './styles/components.css'
import './styles/index.css'
import './styles/animations.css'
import './App.css'
// Apply theme from config
document.body.classList.add(SITE_THEME)
document.documentElement.classList.add('visible')
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
