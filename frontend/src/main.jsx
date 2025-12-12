import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// Global Styles
import './styles/app.css'
import './styles/global.css'
import './styles/navbar.css'
import './styles/auth.css'
import './styles/forms.css'
import './styles/admin-dashboard.css'
import './styles/client-dashboard.css'
import './styles/public-home.css'
import './styles/public-services.css'
import './styles/public-about.css'
import './styles/public-contact.css'

// Component Styles
import './index.css'


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)