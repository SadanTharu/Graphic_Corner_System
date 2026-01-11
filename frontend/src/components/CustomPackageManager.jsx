import React, { useState, useEffect } from 'react'
import API from '../api'

export default function CustomPackageManager() {
  const [packages, setPackages] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    clientId: '',
    packageName: '',
    description: '',
    price: '',
    taskCount: '',
    revisionLimit: '',
    deliveryDays: '7',
    notes: '',
    features: [],
    services: [],
    billingDay: 27
  })

  useEffect(() => {
    loadClients()
    loadPackages()
  }, [])

  const addService = () => {
    setFormData({
      ...formData,
      services: [...(formData.services || []), { name: '', description: '', count: 0 }]
    })
  }

  const removeService = (index) => {
    const list = [...formData.services]
    list.splice(index, 1)
    setFormData({ ...formData, services: list })
  }

  const handleServiceChange = (index, field, value) => {
    const list = [...formData.services]
    list[index][field] = value
    setFormData({ ...formData, services: list })
  }

  const loadClients = async () => {
    try {
      const response = await API.get('/clients')
      // Filter only task-based customers
      setClients(response.data)
    } catch (err) {
      console.error('Failed to load clients')
    }
  }

  const loadPackages = async () => {
    try {
      const response = await API.get('/custom-packages')
      setPackages(response.data)
    } catch (err) {
      setError('Failed to load packages')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.clientId || !formData.packageName || !formData.price) {
      setError('Client, name, and price are required')
      return
    }

    try {
      if (editingId) {
        await API.put(`/custom-packages/${editingId}`, formData)
        setSuccess('Package updated successfully!')
      } else {
        await API.post('/custom-packages', formData)
        setSuccess('Package created successfully!')
      }

      resetForm()
      loadPackages()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save package')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await API.delete(`/custom-packages/${id}`)
        setSuccess('Package deleted')
        loadPackages()
      } catch (err) {
        setError('Failed to delete')
      }
    }
  }

  const startEdit = (pkg) => {
    setEditingId(pkg._id)
    setFormData({
      ...pkg,
      clientId: pkg.clientId?._id || pkg.clientId,
      services: pkg.services || [],
      billingDay: pkg.billingDay || 27
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      packageName: '',
      description: '',
      price: '',
      taskCount: '',
      revisionLimit: '',
      deliveryDays: '7',
      notes: '',
      features: [],
      services: [],
      billingDay: 27
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getClientName = (clientId) => {
    if (!clientId) return 'N/A'
    if (clients.length === 0) return 'Loading...'

    // Check if clientId is already a populated object
    if (clientId.name) return clientId.name

    // Otherwise lookup by ID (handles both Database _id and String clientId)
    const id = clientId.toString()
    const client = clients.find(c => c._id?.toString() === id || c.clientId === id)
    return client?.name || 'Unknown'
  }

  return (
    <div className="custom-package-manager">
      <div className="manager-header">
        <h3>Custom Packages (Task-Based)</h3>
        <button className="btn-submit" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ New Package'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="custom-package-form">
          <div className="form-row">
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            >
              <option value="">Select Customer</option>
              {clients.map(c => (
                <option key={c._id} value={c.clientId}>{c.name} ({c.clientId})</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Package Name"
              value={formData.packageName}
              onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>

          <div className="form-row">
            <input
              type="number"
              placeholder="Total Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Billing Day (1-31)"
              value={formData.billingDay}
              onChange={(e) => setFormData({ ...formData, billingDay: e.target.value })}
            />
          </div>

          <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px dashed #cbd5e0', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '1rem', color: 'white' }}>Included Services</h4>
            {formData.services?.map((s, idx) => (
              <div key={idx} className="form-row" style={{ marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Service Name"
                  value={s.name}
                  onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={s.description}
                  onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  placeholder="Count"
                  value={s.count}
                  onChange={(e) => handleServiceChange(idx, 'count', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeService(idx)} style={{ background: '#feb2b2', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 10px' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addService} className="btn-action" style={{ width: 'auto' }}>+ Add Service Item</button>
          </div>

          <div className="form-row">
            <input
              type="number"
              placeholder="Number of Tasks"
              value={formData.taskCount}
              onChange={(e) => setFormData({ ...formData, taskCount: e.target.value })}
            />
            <input
              type="number"
              placeholder="Revision Limit"
              value={formData.revisionLimit}
              onChange={(e) => setFormData({ ...formData, revisionLimit: e.target.value })}
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              placeholder="Delivery Days"
              value={formData.deliveryDays}
              onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Notes (Legacy)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          ></textarea>

          <div className="form-actions">
            <button type="submit" className="btn-submit">{editingId ? 'Update' : 'Create'} Package</button>
            <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Package Name</th>
              <th>Price</th>
              <th>Tasks</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg._id}>
                <td>{pkg.clientId?.name || getClientName(pkg.clientId)}</td>
                <td>{pkg.packageName}</td>
                <td>${pkg.price}</td>
                <td>
                  {pkg.services && pkg.services.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '0.85rem' }}>
                      {pkg.services.map((s, i) => (
                        <li key={i}>
                          <strong>{s.count}x</strong> {s.name}
                          {s.description && <span style={{ display: 'block', opacity: 0.6, fontSize: '0.75rem' }}>{s.description}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : pkg.taskCount}
                </td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(pkg.tasksCompleted / pkg.taskCount * 100) || 0}%` }}
                    ></div>
                  </div>
                  <small>{pkg.tasksCompleted}/{pkg.taskCount}</small>
                </td>
                <td><span className={`status-badge status-${pkg.status}`}>{pkg.status}</span></td>
                <td><span className={`status-badge status-${pkg.paymentStatus}`}>{pkg.paymentStatus}</span></td>
                <td>
                  <button className="btn-action edit" onClick={() => startEdit(pkg)}>Edit</button>
                  <button className="btn-action delete" onClick={() => handleDelete(pkg._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {packages.length === 0 && (
        <p className="no-data">No custom packages yet</p>
      )}
    </div>
  )
}
