import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'


export default function Navbar(){
  const logged = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  function logout(){ 
    localStorage.clear(); 
    window.location.href='/' 
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎨</span>
          Graphic Corner
        </Link>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          
          <Link 
            to="/services" 
            className={`nav-link ${isActive('/services') ? 'active' : ''}`}
          >
            Services
          </Link>
          
          {!logged && (
            <Link 
              to="/auth/login" 
              className={`nav-link login-link ${isActive('/auth/login') ? 'active' : ''}`}
            >
              Login
            </Link>
          )}
          
          {logged && role === 'client' && (
            <Link 
              to="/client" 
              className={`nav-link client-link ${isActive('/client') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
          
          {logged && role === 'admin' && (
            <Link 
              to="/admin" 
              className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
            >
              Admin
            </Link>
          )}
          
          {logged && (
            <button 
              onClick={logout}
              className="nav-logout-btn"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}