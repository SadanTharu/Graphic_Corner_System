import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/public-home.css'

export default function PublicHome() {
  return (
    <div className="public-home">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Create Stunning Graphics & Content</h1>
          <p className="hero-subtitle">
            Professional design services for your brand. From logos to social media content, we bring your vision to life.
          </p>
          <div className="hero-buttons">
            <Link to="/services" className="btn btn-primary">
              View Services
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Get in Touch
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-shape"></div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="section-container">
          <h2 className="section-title">Why Choose Graphic Corner?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Creative Excellence</h3>
              <p>Award-winning designs that make your brand stand out from the competition.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Turnaround</h3>
              <p>Fast delivery without compromising on quality. Most projects completed within 48 hours.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Affordable Pricing</h3>
              <p>Flexible packages designed to fit every budget. No hidden costs, transparent pricing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Dedicated Support</h3>
              <p>Your success is our success. We provide ongoing support and unlimited revisions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Modern Design</h3>
              <p>Latest trends and techniques to keep your brand fresh and relevant.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Custom Solutions</h3>
              <p>Tailored designs that match your unique brand identity and requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Projects Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">8+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Elevate Your Brand?</h2>
          <p>Join hundreds of satisfied clients and transform your visual presence today.</p>
          <Link to="/contact" className="btn btn-white">
            Start Your Project
          </Link>
        </div>
      </section>
    </div>
  )
}