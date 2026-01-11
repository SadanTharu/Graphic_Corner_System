import React, { useEffect, useState } from 'react'
import API, { setAuthToken } from '../api'
import CreateCustomer from '../components/CreateCustomer'
import MembershipManager from '../components/MembershipManager'
import CustomPackageManager from '../components/CustomPackageManager'
import '../styles/admin-dashboard.css'

export default function AdminDashboard() {
  useEffect(() => { setAuthToken(localStorage.getItem('token')); }, [])

  // States
  const [activeTab, setActiveTab] = useState('overview')
  const [clients, setClients] = useState([])
  const [contents, setContents] = useState([])
  const [packages, setPackages] = useState([])
  const [payments, setPayments] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [editingContent, setEditingContent] = useState(null)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Form states
  const [clientForm, setClientForm] = useState({
    clientId: '', name: '', email: '', password: '', contact: '', status: 'active'
  })
  const [contentForm, setContentForm] = useState({
    title: '', notes: '', deadline: '', status: 'pending', clientId: '', driveLink: ''
  })

  // Load all data
  const loadAllData = () => {
    loadClients()
    loadContents()
    loadPackages()
    loadPayments()
  }

  const loadClients = () => {
    API.get('/clients')
      .then(r => setClients(r.data))
      .catch(err => console.error('Failed to load clients:', err))
  }

  const loadContents = () => {
    API.get('/contents')
      .then(r => setContents(r.data || []))
      .catch(err => console.error('Failed to load contents:', err))
  }

  const loadPackages = () => {
    API.get('/packages')
      .then(r => setPackages(r.data || []))
      .catch(err => console.error('Failed to load packages:', err))
  }

  const loadPayments = () => {
    API.get('/payments')
      .then(r => setPayments(r.data || []))
      .catch(err => console.error('Failed to load payments:', err))
  }

  useEffect(() => { loadAllData() }, [])

  // Customer CRUD
  const handleCreateClient = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!clientForm.clientId || !clientForm.name || !clientForm.email || !clientForm.password) {
      setFormError('All fields are required')
      return
    }

    try {
      await API.post('/clients', clientForm)
      setFormSuccess('Customer created successfully!')
      setClientForm({ clientId: '', name: '', email: '', password: '', contact: '', status: 'active' })
      loadClients()
      setTimeout(() => setShowCreateForm(false), 500)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create customer')
    }
  }

  const handleUpdateClient = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    try {
      await API.put(`/clients/${editingClient._id}`, {
        name: clientForm.name,
        email: clientForm.email,
        contact: clientForm.contact,
        status: clientForm.status
      })
      setFormSuccess('Customer updated successfully!')
      setEditingClient(null)
      setClientForm({ clientId: '', name: '', email: '', password: '', contact: '', status: 'active' })
      loadClients()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update customer')
    }
  }

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await API.delete(`/clients/${clientId}`)
        setFormSuccess('Customer deleted successfully!')
        loadClients()
      } catch (err) {
        setFormError('Failed to delete customer')
      }
    }
  }

  const startEditClient = (client) => {
    setEditingClient(client)
    setClientForm({
      clientId: client.clientId,
      name: client.name,
      email: client.email,
      password: '',
      contact: client.contact,
      status: client.status
    })
    setActiveTab('customers')
  }

  // Content CRUD
  const handleCreateContent = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!contentForm.title || !contentForm.clientId || !contentForm.deadline) {
      setFormError('Title, client, and deadline are required')
      return
    }

    try {
      await API.post('/contents', contentForm)
      setFormSuccess('Task created successfully!')
      setContentForm({ title: '', notes: '', deadline: '', status: 'pending', clientId: '', driveLink: '' })
      loadContents()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task')
    }
  }

  const handleUpdateContent = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    const { _id, __v, createdAt, updatedAt, ...updateData } = contentForm;

    try {
      await API.put(`/contents/${editingContent._id || editingContent}`, updateData)
      setFormSuccess('Task updated successfully!')
      setEditingContent(null)
      setContentForm({ title: '', notes: '', deadline: '', status: 'pending', clientId: '', driveLink: '' })
      loadContents()
    } catch (err) {
      console.error('Update Error:', err);
      setFormError(err.response?.data?.message || 'Failed to update task')
    }
  }

  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await API.delete(`/contents/${contentId}`)
        setFormSuccess('Task deleted successfully!')
        loadContents()
      } catch (err) {
        setFormError('Failed to delete task')
      }
    }
  }

  const startEditContent = (content) => {
    setEditingContent(content)
    setContentForm({
      title: content.title || '',
      notes: content.notes || '',
      deadline: content.deadline ? (content.deadline.includes('T') ? content.deadline.split('T')[0] : content.deadline) : '',
      status: content.status || 'pending',
      clientId: content.clientId || '',
      driveLink: content.driveLink || ''
    })
    setActiveTab('tasks')
  }

  const handleVerifyPayment = async (paymentId, status) => {
    const notes = window.prompt(`Enter notes for this ${status} (optional):`)
    if (notes === null) return; // Cancelled

    try {
      await API.post(`/payments/verify/${paymentId}`, { status, notes })
      setFormSuccess(`Payment ${status} successfully!`)
      loadPayments()
      loadClients() // Reload clients to see updated advance status
    } catch (err) {
      setFormError(err.response?.data?.message || 'Verification failed')
    }
  }

  // Calculate stats
  const stats = {
    totalCustomers: clients.length,
    activeCustomers: clients.filter(c => c.status === 'active').length,
    totalTasks: contents.length,
    pendingTasks: contents.filter(c => c.status === 'pending').length,
    completedTasks: contents.filter(c => c.status === 'completed').length,
    totalPackages: packages.length + (typeof customPackages !== 'undefined' ? 0 : 0), // Placeholder for packages+custom
    totalPayments: payments.length,
    paidPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalRevenue: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  // Get client name by ID
  const getClientName = (clientId) => {
    if (!clientId) return 'Unknown'
    if (clients.length === 0) return 'Loading...'

    // Check if clientId is already a populated object
    if (clientId.name) return clientId.name

    // Otherwise lookup by ID (handles both Database _id and String clientId)
    const id = clientId.toString()
    const client = clients.find(c => (c._id?.toString() === id) || (c.clientId === id))
    return client?.name || 'Unknown'
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Admin Dashboard</h2>
          <p className="dashboard-subtitle">Manage your business</p>
        </div>
        <button
          className="btn-create-customer"
          onClick={() => { setShowCreateForm(!showCreateForm); setEditingClient(null) }}
        >
          {showCreateForm ? '✕ Close' : '+ Create Customer'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid-admin">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-value">{stats.totalCustomers}</p>
            <p className="stat-meta">{stats.activeCustomers} active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <p className="stat-value">{stats.totalTasks}</p>
            <p className="stat-meta">{stats.completedTasks} completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
            <p className="stat-meta">{stats.paidPayments} payments received</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Payments</h3>
            <p className="stat-value">{stats.pendingPayments}</p>
            <p className="stat-meta">Awaiting payment</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3 className="chart-title">Task Status Distribution</h3>
          <div className="chart-pie">
            <div className="pie-segment" style={{
              background: `conic-gradient(#667eea 0deg ${stats.completedTasks / stats.totalTasks * 360}deg, #764ba2 ${stats.completedTasks / stats.totalTasks * 360}deg ${(stats.completedTasks + stats.pendingTasks) / stats.totalTasks * 360}deg, #cbd5e0 ${(stats.completedTasks + stats.pendingTasks) / stats.totalTasks * 360}deg)`
            }}></div>
            <div className="pie-legend">
              <div><span style={{ background: '#667eea' }}></span> Completed ({stats.completedTasks})</div>
              <div><span style={{ background: '#764ba2' }}></span> Pending ({stats.pendingTasks})</div>
              <div><span style={{ background: '#cbd5e0' }}></span> In Progress ({stats.totalTasks - stats.completedTasks - stats.pendingTasks})</div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Payment Status Overview</h3>
          <div className="chart-bars">
            <div className="bar-item">
              <label>Paid</label>
              <div className="bar-background">
                <div className="bar-fill paid" style={{ width: `${stats.totalPayments > 0 ? (stats.paidPayments / stats.totalPayments * 100) : 0}%` }}></div>
              </div>
              <span>{stats.paidPayments}/{stats.totalPayments}</span>
            </div>
            <div className="bar-item">
              <label>Pending</label>
              <div className="bar-background">
                <div className="bar-fill pending" style={{ width: `${stats.totalPayments > 0 ? (stats.pendingPayments / stats.totalPayments * 100) : 0}%` }}></div>
              </div>
              <span>{stats.pendingPayments}/{stats.totalPayments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>👥 Customers</button>
        <button className={`tab-btn ${activeTab === 'memberships' ? 'active' : ''}`} onClick={() => setActiveTab('memberships')}>💳 Memberships</button>
        <button className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>📦 Custom Packages</button>
        <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>📋 Tasks</button>
        <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>💰 Payments</button>
      </div>

      {/* Messages */}
      {formError && <div className="alert alert-error">{formError}</div>}
      {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="tab-content">
          {showCreateForm && (
            <div className="form-container">
              <h3>{editingClient ? 'Edit Customer' : 'Create New Customer'}</h3>
              <form onSubmit={editingClient ? handleUpdateClient : handleCreateClient}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Client ID"
                    value={clientForm.clientId}
                    onChange={(e) => setClientForm({ ...clientForm, clientId: e.target.value })}
                    disabled={editingClient}
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Contact"
                    value={clientForm.contact}
                    onChange={(e) => setClientForm({ ...clientForm, contact: e.target.value })}
                  />
                </div>
                {!editingClient && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={clientForm.password}
                    onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                  />
                )}
                <div className="form-row">
                  <select value={clientForm.status} onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button type="submit" className="btn-submit">{editingClient ? 'Update Customer' : 'Create Customer'}</button>
                </div>
              </form>
            </div>
          )}

          <h3 className="section-title">All Customers ({clients.length})</h3>
          {clients.length === 0 ? (
            <p className="no-data">No customers yet. Create one to get started!</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Advance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c._id}>
                      <td>{c.clientId}</td>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>
                        {(c.customerType === 'monthly_subscription' || c.customerType === 'task_based') ? (
                          <span className={`status-badge ${c.paymentTracking?.isAdvancePaid ? 'status-paid' : 'status-pending'}`} style={{
                            background: c.paymentTracking?.isAdvancePaid ? '#48bb78' : '#ed8936',
                            color: 'white'
                          }}>
                            {c.paymentTracking?.isAdvancePaid ? 'Paid' : 'Pending'}
                          </span>
                        ) : '-'}
                      </td>
                      <td><span className={`status-badge status-${c.status || 'active'}`}>{c.status || 'active'}</span></td>
                      <td>
                        <button className="btn-action edit" onClick={() => startEditClient(c)}>Edit</button>
                        <button className="btn-action delete" onClick={() => handleDeleteClient(c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="tab-content">
          <div className="form-container">
            <h3>{editingContent ? 'Edit Task' : 'Create New Task'}</h3>
            <form onSubmit={editingContent ? handleUpdateContent : handleCreateContent}>
              <input
                type="text"
                placeholder="Task Title"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
              />
              <textarea
                placeholder="Notes / Description"
                value={contentForm.notes}
                onChange={(e) => setContentForm({ ...contentForm, notes: e.target.value })}
              ></textarea>
              <div className="form-row">
                <select
                  value={contentForm.clientId}
                  onChange={(e) => setContentForm({ ...contentForm, clientId: e.target.value })}
                >
                  <option value="">Select Customer</option>
                  {clients.map(c => (
                    <option key={c._id} value={c.clientId}>{c.name} ({c.clientId})</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={contentForm.deadline}
                  onChange={(e) => setContentForm({ ...contentForm, deadline: e.target.value })}
                />
              </div>
              <div className="form-row">
                <select
                  value={contentForm.status}
                  onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  type="text"
                  placeholder="Drive Link (Full URL)"
                  value={contentForm.driveLink}
                  onChange={(e) => setContentForm({ ...contentForm, driveLink: e.target.value })}
                />
                <button type="submit" className="btn-submit">{editingContent ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>

          <h3 className="section-title">All Tasks ({contents.length})</h3>
          {contents.length === 0 ? (
            <p className="no-data">No tasks yet. Create one to get started!</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Customer</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map(c => (
                    <tr key={c._id}>
                      <td>{c.title}</td>
                      <td>{getClientName(c.clientId)}</td>
                      <td>{new Date(c.deadline).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>
                      <td>
                        {c.driveLink ? (
                          <a href={c.driveLink} target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff', textDecoration: 'underline' }}>View</a>
                        ) : '-'}
                      </td>
                      <td>
                        <button className="btn-action edit" onClick={() => startEditContent(c)}>Edit</button>
                        <button className="btn-action delete" onClick={() => handleDeleteContent(c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="tab-content">
          <h3 className="section-title">Payment History ({payments.length})</h3>
          {payments.length === 0 ? (
            <p className="no-data">No payments recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Slip</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td>{p._id.slice(0, 8)}...</td>
                      <td>{getClientName(p.clientId)}</td>
                      <td>${p.amount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span className={`status-badge status-${p.status}`} style={{
                          background: p.status === 'pending' ? '#ed8936' : p.status === 'paid' ? '#48bb78' : '#e53e3e'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-'}</td>
                      <td>
                        {p.slipUrl ? (
                          <a href={p.slipUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'underline' }}>View Slip</a>
                        ) : '-'}
                      </td>
                      <td>
                        {p.status === 'pending' && p.slipUrl && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn-action edit" onClick={() => handleVerifyPayment(p._id, 'verified')} style={{ background: '#48bb78' }}>Verify</button>
                            <button className="btn-action delete" onClick={() => handleVerifyPayment(p._id, 'rejected')}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Memberships Tab */}
      {activeTab === 'memberships' && (
        <div className="tab-content">
          <MembershipManager />
        </div>
      )}

      {/* Custom Packages Tab */}
      {activeTab === 'packages' && (
        <div className="tab-content">
          <CustomPackageManager />
        </div>
      )}
    </div>
  )
}