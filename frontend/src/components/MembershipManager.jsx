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
    features: [],
    servicePackages: [],
    billingDay: 27
  })

  const addServicePackage = () => {
    setFormData({
      ...formData,
      servicePackages: [...(formData.servicePackages || []), { title: '', count: 0, description: '' }]
    })
  }

  const removeServicePackage = (index) => {
    const list = [...formData.servicePackages]
    list.splice(index, 1)
    setFormData({ ...formData, servicePackages: list })
  }

  const handleServiceChange = (index, field, value) => {
    const list = [...formData.servicePackages]
    list[index][field] = value
    setFormData({ ...formData, servicePackages: list })
  }

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
    setFormData({
      ...membership,
      servicePackages: membership.servicePackages || []
    })
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
      features: [],
      servicePackages: [],
      billingDay: 27
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
              placeholder="Package Name (e.g., Video Gold Pack)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Total Package Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>

          <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px dashed #cbd5e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '1rem' }}>Included Service Counts</h4>
            {formData.servicePackages?.map((sp, idx) => (
              <div key={idx} className="form-row" style={{ marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Service Title (e.g. Short Videos)"
                  value={sp.title}
                  onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  placeholder="Count"
                  value={sp.count}
                  onChange={(e) => handleServiceChange(idx, 'count', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeServicePackage(idx)} style={{ background: '#feb2b2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addServicePackage} className="btn-action" style={{ width: 'auto' }}>+ Add Service Item</button>
          </div>

          <div className="form-row">
            <input
              type="number"
              placeholder="Billing Day (1-31)"
              value={formData.billingDay}
              onChange={(e) => setFormData({ ...formData, billingDay: e.target.value })}
            />
            <select value={formData.supportLevel} onChange={(e) => setFormData({ ...formData, supportLevel: e.target.value })}>
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
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              maxLength="2"
            />
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
            <div key={m._id} className="membership-card" style={{ borderTopColor: m.color }}>
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
