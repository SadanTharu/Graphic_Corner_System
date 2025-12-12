import React, { useState } from 'react'
import API from '../api'
import '../styles/forms.css'

export default function CreateCustomer({ onCustomerCreated }) {
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    email: '',
    password: '',
    contact: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.clientId || !formData.email || !formData.password) {
        setError('clientId, email, and password are required')
        setIsLoading(false)
        return
      }

      const response = await API.post('/clients', {
        clientId: formData.clientId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contact: formData.contact,
        status: 'active'
      })

      setMessage(`✓ Customer "${formData.name || formData.clientId}" created successfully!`)
      
      // Reset form
      setFormData({
        clientId: '',
        name: '',
        email: '',
        password: '',
        contact: ''
      })

      // Notify parent component
      if (onCustomerCreated) {
        onCustomerCreated()
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create customer'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="create-customer-container">
      <div className="form-card">
        <h3 className="form-title">Create New Customer</h3>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label htmlFor="clientId" className="form-label">Client ID *</label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              placeholder="e.g., CLI001"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Customer Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., customer@example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter secure password"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact" className="form-label">Contact</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g., +1-555-0123"
              className="form-input"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Customer'}
          </button>
        </form>
      </div>
    </div>
  )
}
