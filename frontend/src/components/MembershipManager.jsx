import React, { useState, useEffect } from 'react'
import API from '../api'

export default function MembershipManager() {
  const [memberships, setMemberships] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    taskLimit: '',
    revisionLimit: '',
    supportLevel: 'basic',
    icon: '📦',
    color: '#667eea',
    features: []
  })

  useEffect(() => {
    loadMemberships()
  }, [])

  const loadMemberships = async () => {
    try {
      const response = await API.get('/memberships')
      setMemberships(response.data)
    } catch (err) {
      setError('Failed to load memberships')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.price) {
      setError('Name and price are required')
      return
    }

    try {
      if (editingId) {
        await API.put(`/memberships/${editingId}`, formData)
        setSuccess('Membership updated successfully!')
      } else {
        await API.post('/memberships', formData)
        setSuccess('Membership created successfully!')
      }
      
      resetForm()
      loadMemberships()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save membership')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await API.delete(`/memberships/${id}`)
        setSuccess('Membership deleted')
        loadMemberships()
      } catch (err) {
        setError('Failed to delete')
      }
    }
  }

  const startEdit = (membership) => {
    setEditingId(membership._id)
    setFormData(membership)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      billingCycle: 'monthly',
      taskLimit: '',
      revisionLimit: '',
      supportLevel: 'basic',
      icon: '📦',
      color: '#667eea',
      features: []
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="membership-manager">
      <div className="manager-header">
        <h3>Membership Packages</h3>
        <button className="btn-submit" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ New Package'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="membership-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Package Name (e.g., Basic, Professional)"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Monthly Price"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>

          <div className="form-row">
            <input
              type="number"
              placeholder="Max Tasks/Month"
              value={formData.taskLimit}
              onChange={(e) => setFormData({...formData, taskLimit: e.target.value})}
            />
            <input
              type="number"
              placeholder="Revision Limit"
              value={formData.revisionLimit}
              onChange={(e) => setFormData({...formData, revisionLimit: e.target.value})}
            />
          </div>

          <div className="form-row">
            <select value={formData.billingCycle} onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <select value={formData.supportLevel} onChange={(e) => setFormData({...formData, supportLevel: e.target.value})}>
              <option value="basic">Basic Support</option>
              <option value="priority">Priority Support</option>
              <option value="vip">VIP Support</option>
            </select>
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              maxLength="2"
            />
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">{editingId ? 'Update' : 'Create'} Membership</button>
            <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="memberships-grid">
        {memberships.length === 0 ? (
          <p className="no-data">No memberships yet</p>
        ) : (
          memberships.map(m => (
            <div key={m._id} className="membership-card" style={{borderTopColor: m.color}}>
              <div className="membership-icon">{m.icon}</div>
              <h4>{m.name}</h4>
              <p className="price">${m.price}/{m.billingCycle}</p>
              <p className="description">{m.description}</p>
              
              <div className="features">
                <p><strong>Tasks:</strong> {m.taskLimit || 'Unlimited'}</p>
                <p><strong>Revisions:</strong> {m.revisionLimit || 'Unlimited'}</p>
                <p><strong>Support:</strong> {m.supportLevel}</p>
              </div>

              <div className="actions">
                <button className="btn-action edit" onClick={() => startEdit(m)}>Edit</button>
                <button className="btn-action delete" onClick={() => handleDelete(m._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
