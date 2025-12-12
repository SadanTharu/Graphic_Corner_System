import React, { useEffect, useState } from 'react'
import API, { setAuthToken } from '../api'
import '../styles/client-dashboard.css'


export default function ClientDashboard() {
  const clientId = localStorage.getItem('clientId');
  const clientName = localStorage.getItem('name');
  
  useEffect(() => { setAuthToken(localStorage.getItem('token')); }, [])
  
  const [packages, setPackages] = useState([])
  const [contents, setContents] = useState([])
  const [payments, setPayments] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    API.get('/clients/me').then(r => setProfile(r.data)).catch(() => {})
    API.get(`/packages/client/${clientId}`).then(r => setPackages(r.data)).catch(() => {})
    API.get(`/contents/client/${clientId}`).then(r => setContents(r.data)).catch(() => {})
    API.get(`/payments/client/${clientId}`).then(r => setPayments(r.data)).catch(() => {})
  }, [clientId])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/auth/login'
  }

  const activeContents = contents.filter(c => c.status !== 'completed') || []
  const completedContents = contents.filter(c => c.status === 'completed') || []
  const pendingPayments = payments.filter(p => p.status === 'pending') || []

  return (
    <div className="client-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Welcome, {clientName}!</h1>
          <p className="dashboard-subtitle">Your project management hub</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <section className="stats-overview">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-label">Active Packages</div>
                <div className="stat-value">{packages.length}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-label">Pending Tasks</div>
                <div className="stat-value">{activeContents.length}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Pending Payments</div>
                <div className="stat-value">${pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{completedContents.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="dashboard-tabs">
        <div className="section-container">
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              Packages
            </button>
            <button 
              className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Content Progress
            </button>
            <button 
              className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="dashboard-content">
        <div className="section-container">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="overview-grid">
                <div className="overview-section">
                  <h3>Recent Content</h3>
                  {activeContents.length === 0 ? (
                    <p className="no-data">No active content items</p>
                  ) : (
                    <div className="items-list">
                      {activeContents.slice(0, 3).map(c => (
                        <div key={c._id} className="list-item">
                          <div className="item-title">{c.title}</div>
                          <div className="item-meta">
                            <span className={`status ${c.status}`}>{c.status}</span>
                            {c.deadline && <span className="deadline">Due: {new Date(c.deadline).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="overview-section">
                  <h3>Upcoming Payments</h3>
                  {pendingPayments.length === 0 ? (
                    <p className="no-data">No pending payments</p>
                  ) : (
                    <div className="items-list">
                      {pendingPayments.slice(0, 3).map(p => (
                        <div key={p._id} className="list-item">
                          <div className="item-title">{p.title}</div>
                          <div className="item-amount">${p.amount}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="tab-content">
              <h2 className="content-title">Your Packages</h2>
              {packages.length === 0 ? (
                <p className="no-data">No packages assigned yet</p>
              ) : (
                <div className="items-grid">
                  {packages.map(p => (
                    <div key={p._id} className="item-card">
                      <h4 className="item-title">{p.packageName}</h4>
                      <p className="item-desc">{p.description}</p>
                      <div className="item-details">
                        <div className="detail">
                          <span className="label">Price:</span>
                          <span className="value">${p.price}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Duration:</span>
                          <span className="value">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content Progress Tab */}
          {activeTab === 'content' && (
            <div className="tab-content">
              <h2 className="content-title">Content Progress</h2>
              
              <div className="content-sections">
                {activeContents.length > 0 && (
                  <div className="section">
                    <h3 className="subsection-title">Active Tasks</h3>
                    <div className="content-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Deadline</th>
                            <th>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeContents.map(c => (
                            <tr key={c._id}>
                              <td>{c.title}</td>
                              <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                              <td>{c.deadline ? new Date(c.deadline).toLocaleDateString() : 'N/A'}</td>
                              <td>
                                {c.driveLink ? (
                                  <a href={c.driveLink} target="_blank" rel="noopener noreferrer" className="link-btn">
                                    View
                                  </a>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {completedContents.length > 0 && (
                  <div className="section">
                    <h3 className="subsection-title">Completed</h3>
                    <div className="content-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Completed</th>
                            <th>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedContents.map(c => (
                            <tr key={c._id}>
                              <td>{c.title}</td>
                              <td>✅ Completed</td>
                              <td>
                                {c.driveLink ? (
                                  <a href={c.driveLink} target="_blank" rel="noopener noreferrer" className="link-btn">
                                    Download
                                  </a>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeContents.length === 0 && completedContents.length === 0 && (
                  <p className="no-data">No content items</p>
                )}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="tab-content">
              <h2 className="content-title">Payment History</h2>
              {payments.length === 0 ? (
                <p className="no-data">No payment records</p>
              ) : (
                <div className="payment-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p._id} className={`status-${p.status}`}>
                          <td>{p.title}</td>
                          <td className="amount">${p.amount}</td>
                          <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                          <td>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2 className="content-title">Your Profile</h2>
              {profile && (
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">👤</div>
                    <div className="profile-info">
                      <h3>{profile.name}</h3>
                      <p className="profile-role">Client</p>
                    </div>
                  </div>
                  <div className="profile-details">
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{profile.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Contact:</span>
                      <span className="detail-value">{profile.contact || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Client ID:</span>
                      <span className="detail-value font-mono">{profile.clientId}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}