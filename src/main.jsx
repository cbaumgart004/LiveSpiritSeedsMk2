import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 🟢 Import themes BEFORE index.css or any component styles
import './styles/themes.css' // << Make sure this path matches your folder
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
