import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import heroImg from '../assets/hero.png'
import '../styles/public-home.css'

export default function PublicHome() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/memberships')
      .then(res => {
        setMemberships(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch memberships:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="public-home">
      {/* Hero Banner */}
      <section className="hero-section">
        <img src={heroImg} alt="Agency Visual" className="hero-background-img" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Experience the Future of Digital Content</h1>
          <p className="hero-subtitle">
            From hyper-realistic 3D animations to AI-driven video production.
            We are the ultimate power-house for modern brands.
          </p>
          <div className="hero-buttons" style={{ justifyContent: 'center', display: 'flex', gap: '20px' }}>
            <Link to="/auth/register" className="btn-premium btn-primary-glass">
              Start Your Journey
            </Link>
            <Link to="/services" className="btn-premium" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="packages-section">
        <div className="section-container">
          <span className="section-tag">Unlimited Potential</span>
          <h2 className="section-title">Investment <span className="text-gradient">Packages</span></h2>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading opportunities...</p>
          ) : (
            <div className="packages-grid">
              {memberships.map(pkg => (
                <div className="package-card" key={pkg._id}>
                  <div className="package-header">
                    <div className="package-icon">{pkg.icon || '🚀'}</div>
                    <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>{pkg.name}</h3>
                    <div className="package-price-wrap">
                      <span className="price-sub">From </span>
                      <span className="price-main">${(pkg.price * 0.25).toLocaleString()}</span>
                    </div>
                    <span className="advance-tag">25% Advance to Start</span>
                    <p style={{ marginTop: '1rem', color: '#a0aec0' }}>{pkg.description}</p>
                  </div>

                  <ul className="package-features">
                    {/* Map servicePackages if available, otherwise features */}
                    {pkg.servicePackages && pkg.servicePackages.length > 0 ? (
                      pkg.servicePackages.map((sp, idx) => (
                        <li key={idx}><strong>{sp.count}x</strong> {sp.title}</li>
                      ))
                    ) : (
                      pkg.features.map((f, idx) => (
                        <li key={idx}>{f.name}</li>
                      ))
                    )}
                    <li>{pkg.supportLevel.toUpperCase()} Support</li>
                    <li>{pkg.deliveryDays} Days Delivery</li>
                  </ul>

                  <Link to={`/auth/register?pkg=${pkg._id}`} className="btn-premium btn-primary-glass">
                    Select Plan
                  </Link>
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem', opacity: 0.6 }}>
                    Balance of ${(pkg.price * 0.75).toLocaleString()} due at month end
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-premium">
        <div className="cta-content">
          <h2 className="text-gradient">Ready to Scale?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.8 }}>
            Join 500+ global brands leveraging our creative expertise.
          </p>
          <Link to="/contact" className="btn-premium btn-primary-glass" style={{ padding: '1.5rem 4rem', fontSize: '1.2rem' }}>
            Contact Our Strategists
          </Link>
        </div>
      </section>
    </div>
  )
}
