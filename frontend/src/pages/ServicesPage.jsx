import React, { useEffect, useState } from 'react'
import API from '../api'
import '../styles/public-services.css'

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/services')
      .then(res => {
        setServices(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load services:', err)
        setLoading(false)
        // Set default services if API fails
        setServices([
          {
            _id: '1',
            name: 'Video Editing',
            description: 'Professional video editing with effects, transitions, and color grading.',
            price: 299,
            duration: 'per month',
            icon: '🎬'
          },
          {
            _id: '2',
            name: 'Graphic Design',
            description: 'Custom graphics, posts, flyers, thumbnails, and branding materials.',
            price: 199,
            duration: 'per month',
            icon: '🎨'
          },
          {
            _id: '3',
            name: 'Social Media Management',
            description: 'Complete management of Instagram, TikTok, Facebook, and other platforms.',
            price: 399,
            duration: 'per month',
            icon: '📱'
          },
          {
            _id: '4',
            name: 'Content Scheduling',
            description: 'Monthly content calendars and strategic content planning.',
            price: 149,
            duration: 'per month',
            icon: '📅'
          },
          {
            _id: '5',
            name: 'Full Branding',
            description: 'Complete brand identity: logo, color palette, brand guidelines, and more.',
            price: 1299,
            duration: 'one-time',
            icon: '🏢'
          },
          {
            _id: '6',
            name: 'Logo Design',
            description: 'Unique, memorable logo designs with unlimited revisions.',
            price: 349,
            duration: 'one-time',
            icon: '✨'
          }
        ])
      })
  }, [])

  return (
    <div className="public-services">
      {/* Header */}
      <section className="services-header">
        <div className="section-container">
          <h1 className="page-title">Our Services</h1>
          <p className="page-subtitle">
            Choose the perfect service package to elevate your brand
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="section-container">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="no-services">No services available at the moment.</div>
          ) : (
            <div className="services-grid">
              {services.map(service => (
                <div key={service._id} className="service-card">
                  <div className="service-icon">{service.icon || '✨'}</div>
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-pricing">
                    <div className="price">
                      <span className="currency">$</span>
                      <span className="amount">{service.price}</span>
                    </div>
                    <div className="duration">{service.duration}</div>
                  </div>

                  <a href="/contact" className="service-cta">
                    Get Started
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section">
        <div className="section-container">
          <h2 className="section-title">Service Comparison</h2>
          <div className="table-container">
            <table className="services-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service._id}>
                    <td className="service-col">
                      <span className="service-icon-small">{service.icon || '✨'}</span>
                      {service.name}
                    </td>
                    <td>{service.description}</td>
                    <td className="price-col">${service.price}</td>
                    <td>{service.duration}</td>
                    <td>
                      <a href="/contact" className="btn-sm">Contact</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How long does a project take?</h4>
              <p>Most projects are completed within 24-48 hours. Rush orders available upon request.</p>
            </div>
            <div className="faq-item">
              <h4>Can I request revisions?</h4>
              <p>Absolutely! We provide unlimited revisions until you're completely satisfied with the work.</p>
            </div>
            <div className="faq-item">
              <h4>Do you offer custom packages?</h4>
              <p>Yes! Contact us to discuss your specific needs and we'll create a custom package for you.</p>
            </div>
            <div className="faq-item">
              <h4>What file formats do you deliver?</h4>
              <p>We deliver in all major formats including PNG, JPG, SVG, MP4, and fully editable source files.</p>
            </div>
            <div className="faq-item">
              <h4>What's your payment process?</h4>
              <p>Simple and secure. 50% upfront to start your project, 50% due upon completion.</p>
            </div>
            <div className="faq-item">
              <h4>Do you have a portfolio?</h4>
              <p>Yes! View our work and client testimonials on our website. Let's discuss your project!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}