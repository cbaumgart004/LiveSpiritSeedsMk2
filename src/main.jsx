import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // ✅ Keep global styles lightweight

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
