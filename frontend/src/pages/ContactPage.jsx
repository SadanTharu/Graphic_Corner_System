import React, { useState } from 'react'
import API from '../api'
import '../styles/public-contact.css'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Send contact message to backend
      await API.post('/contact', formData)
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send message. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-contact">
      {/* Header */}
      <section className="contact-header">
        <div className="section-container">
          <h1 className="page-title">Get In Touch</h1>
          <p className="page-subtitle">
            Have a project in mind? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="section-container contact-layout">
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <h2>Send us a Message</h2>
            
            {success && <div className="success-message">✓ Thank you! We'll get back to you soon.</div>}
            {error && <div className="error-message">✗ {error}</div>}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="service">Service Interested In</label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">Select a service</option>
                  <option value="Video Editing">Video Editing</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Social Media Management">Social Media Management</option>
                  <option value="Content Scheduling">Content Scheduling</option>
                  <option value="Full Branding">Full Branding</option>
                  <option value="Logo Design">Logo Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info-wrapper">
            <h2>Contact Information</h2>
            
            <div className="contact-info">
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div>
                  <h4>Email</h4>
                  <p>hello@graphiccorner.com</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📱</div>
                <div>
                  <h4>WhatsApp</h4>
                  <a href="https://wa.me/1234567890" className="contact-link">
                    +1 (234) 567-8900
                  </a>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📍</div>
                <div>
                  <h4>Location</h4>
                  <p>123 Design Street<br/>Creative City, CC 12345</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">🕐</div>
                <div>
                  <h4>Business Hours</h4>
                  <p>Monday - Friday: 9 AM - 6 PM<br/>Saturday: 10 AM - 4 PM</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="social-links">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="#" className="social-icon">📘</a>
                <a href="#" className="social-icon">📷</a>
                <a href="#" className="social-icon">🐦</a>
                <a href="#" className="social-icon">▶️</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
