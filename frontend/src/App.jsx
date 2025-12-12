import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PublicHome from './pages/PublicHome'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AuthPages from './pages/AuthPages'
import ProtectedRoute from './components/ProtectedRoute'


export default function App(){
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome/>} />
          <Route path="/services" element={<ServicesPage/>} />
          <Route path="/about" element={<AboutPage/>} />
          <Route path="/contact" element={<ContactPage/>} />
          <Route path="/auth/*" element={<AuthPages/>} />

          {/* Protected Routes */}
          <Route path="/client/*" element={<ProtectedRoute roleRequired="client"><ClientDashboard/></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute roleRequired="admin"><AdminDashboard/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}