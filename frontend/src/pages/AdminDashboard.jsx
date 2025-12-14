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
    title: '', description: '', deadline: '', status: 'pending', clientId: ''
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
      setContentForm({ title: '', description: '', deadline: '', status: 'pending', clientId: '' })
      loadContents()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task')
    }
  }

  const handleUpdateContent = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    try {
      await API.put(`/contents/${editingContent._id}`, contentForm)
      setFormSuccess('Task updated successfully!')
      setEditingContent(null)
      setContentForm({ title: '', description: '', deadline: '', status: 'pending', clientId: '' })
      loadContents()
    } catch (err) {
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
      title: content.title,
      description: content.description,
      deadline: content.deadline?.split('T')[0],
      status: content.status,
      clientId: content.clientId
    })
    setActiveTab('tasks')
  }

  // Calculate stats
  const stats = {
    totalCustomers: clients.length,
    activeCustomers: clients.filter(c => c.status === 'active').length,
    totalTasks: contents.length,
    pendingTasks: contents.filter(c => c.status === 'pending').length,
    completedTasks: contents.filter(c => c.status === 'completed').length,
    totalPayments: payments.length,
    paidPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalRevenue: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  // Get client name by ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId)
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
              <div><span style={{background: '#667eea'}}></span> Completed ({stats.completedTasks})</div>
              <div><span style={{background: '#764ba2'}}></span> Pending ({stats.pendingTasks})</div>
              <div><span style={{background: '#cbd5e0'}}></span> In Progress ({stats.totalTasks - stats.completedTasks - stats.pendingTasks})</div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Payment Status Overview</h3>
          <div className="chart-bars">
            <div className="bar-item">
              <label>Paid</label>
              <div className="bar-background">
                <div className="bar-fill paid" style={{width: `${stats.totalPayments > 0 ? (stats.paidPayments / stats.totalPayments * 100) : 0}%`}}></div>
              </div>
              <span>{stats.paidPayments}/{stats.totalPayments}</span>
            </div>
            <div className="bar-item">
              <label>Pending</label>
              <div className="bar-background">
                <div className="bar-fill pending" style={{width: `${stats.totalPayments > 0 ? (stats.pendingPayments / stats.totalPayments * 100) : 0}%`}}></div>
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
                    onChange={(e) => setClientForm({...clientForm, clientId: e.target.value})}
                    disabled={editingClient}
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                  />
                  <input
                    type="tel"
                    placeholder="Contact"
                    value={clientForm.contact}
                    onChange={(e) => setClientForm({...clientForm, contact: e.target.value})}
                  />
                </div>
                {!editingClient && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={clientForm.password}
                    onChange={(e) => setClientForm({...clientForm, password: e.target.value})}
                  />
                )}
                <div className="form-row">
                  <select value={clientForm.status} onChange={(e) => setClientForm({...clientForm, status: e.target.value})}>
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
                    <th>Contact</th>
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
                      <td>{c.contact || '-'}</td>
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
                onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
              />
              <textarea
                placeholder="Description"
                value={contentForm.description}
                onChange={(e) => setContentForm({...contentForm, description: e.target.value})}
              ></textarea>
              <div className="form-row">
                <select
                  value={contentForm.clientId}
                  onChange={(e) => setContentForm({...contentForm, clientId: e.target.value})}
                >
                  <option value="">Select Customer</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={contentForm.deadline}
                  onChange={(e) => setContentForm({...contentForm, deadline: e.target.value})}
                />
              </div>
              <div className="form-row">
                <select
                  value={contentForm.status}
                  onChange={(e) => setContentForm({...contentForm, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
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
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td>{p._id.slice(0, 8)}...</td>
                      <td>{getClientName(p.clientId)}</td>
                      <td>${p.amount?.toFixed(2) || '0.00'}</td>
                      <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                      <td>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '-'}</td>
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