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
    features: []
  })

  useEffect(() => {
    loadClients()
    loadPackages()
  }, [])

  const loadClients = async () => {
    try {
      const response = await API.get('/clients')
      // Filter only task-based customers
      setClients(response.data.filter(c => c.customerType === 'task_based' || !c.customerType))
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

    if (!formData.clientId || !formData.packageName || !formData.price || !formData.taskCount) {
      setError('Client, name, price, and task count are required')
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
    setFormData(pkg)
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
      features: []
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId)
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
              onChange={(e) => setFormData({...formData, clientId: e.target.value})}
            >
              <option value="">Select Customer</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.clientId})</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Package Name"
              value={formData.packageName}
              onChange={(e) => setFormData({...formData, packageName: e.target.value})}
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
              placeholder="Total Price"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
            <input
              type="number"
              placeholder="Number of Tasks"
              value={formData.taskCount}
              onChange={(e) => setFormData({...formData, taskCount: e.target.value})}
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              placeholder="Revision Limit"
              value={formData.revisionLimit}
              onChange={(e) => setFormData({...formData, revisionLimit: e.target.value})}
            />
            <input
              type="number"
              placeholder="Delivery Days"
              value={formData.deliveryDays}
              onChange={(e) => setFormData({...formData, deliveryDays: e.target.value})}
            />
          </div>

          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                <td>{getClientName(pkg.clientId)}</td>
                <td>{pkg.packageName}</td>
                <td>${pkg.price}</td>
                <td>{pkg.taskCount}</td>
                <td>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{width: `${(pkg.tasksCompleted / pkg.taskCount * 100) || 0}%`}}
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
