import React, { useEffect, useState } from 'react'
import API, { setAuthToken } from '../api'
import '../styles/client-dashboard.css'


export default function ClientDashboard() {
  const clientId = localStorage.getItem('clientId');
  const clientName = localStorage.getItem('name');

  useEffect(() => { setAuthToken(localStorage.getItem('token')); }, [])

  const [packages, setPackages] = useState([])
  const [customPackages, setCustomPackages] = useState([])
  const [contents, setContents] = useState([])
  const [payments, setPayments] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [payForm, setPayForm] = useState({ title: '', amount: '', notes: '' })

  const loadAllData = () => {
    API.get('/clients/me')
      .then(r => {
        setProfile(r.data);
      })
      .catch(() => { })

    API.get(`/custom-packages/client/${clientId}`).then(res => setCustomPackages(res.data)).catch(() => { })
    API.get(`/packages/client/${clientId}`).then(r => setPackages(r.data)).catch(() => { })
    API.get(`/contents/client/${clientId}`).then(r => setContents(r.data)).catch(() => { })
    API.get(`/payments/client/${clientId}`).then(r => setPayments(r.data)).catch(() => { })
  }

  useEffect(() => {
    loadAllData();
  }, [clientId])

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('slip', selectedFile);
      formData.append('title', payForm.title);
      formData.append('amount', payForm.amount);
      formData.append('notes', payForm.notes);

      await API.post('/payments/submit-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadSuccess('Payment slip uploaded successfully! Admin will verify it soon.');
      setPayForm({ title: '', amount: '', notes: '' });
      setSelectedFile(null);
      loadAllData();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload slip');
    } finally {
      setIsUploading(false);
    }
  }

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
          <h1 className="dashboard-title">Welcome, {profile?.name || clientName || 'Customer'}!</h1>
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
                <div className="stat-value">{packages.length + customPackages.length}</div>
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
              {/* Standard Membership Highlight */}
              {profile?.membershipId && (
                <div className="subscription-highlight-card" style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  padding: '2rem',
                  borderRadius: '24px',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <span style={{ color: '#8a2be2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>My Subscription</span>
                      <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{profile.membershipId.name}</h2>
                      <div className={`status-pill ${profile.paymentTracking?.isAdvancePaid ? 'active' : 'pending'}`} style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: profile.paymentTracking?.isAdvancePaid ? 'rgba(72, 187, 120, 0.2)' : 'rgba(237, 137, 54, 0.2)',
                        color: profile.paymentTracking?.isAdvancePaid ? '#48bb78' : '#ed8936',
                        fontWeight: 600
                      }}>
                        {profile.paymentTracking?.isAdvancePaid ? '✓ Active & Ready' : '⏳ Awaiting 25% Advance'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, opacity: 0.7 }}>Next Bill Date</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>Every Month {profile.membershipId.billingDay || 27}th</p>
                      <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>Amount Due</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>${(profile.paymentTracking?.nextPaymentDue || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {profile.membershipId.servicePackages?.map((sp, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px' }}>
                        <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>{sp.title}</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{sp.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Package Highlight */}
              {customPackages.length > 0 && (
                <div className="subscription-highlight-card" style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  padding: '2rem',
                  borderRadius: '24px',
                  marginBottom: '2rem',
                  border: '1px solid rgba(0,210,255,0.1)',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <span style={{ color: '#00d2ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Active Custom Package</span>
                      <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{customPackages[0].packageName}</h2>
                      <div className={`status-pill ${profile?.paymentTracking?.isAdvancePaid ? 'active' : 'pending'}`} style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: profile?.paymentTracking?.isAdvancePaid ? 'rgba(72, 187, 120, 0.2)' : 'rgba(237, 137, 54, 0.2)',
                        color: profile?.paymentTracking?.isAdvancePaid ? '#48bb78' : '#ed8936',
                        fontWeight: 600
                      }}>
                        {profile?.paymentTracking?.isAdvancePaid ? '✓ Active & Ready' : '⏳ Awaiting 25% Advance'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, opacity: 0.7 }}>Billing Day</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>Each {customPackages[0].billingDay || 27}th</p>
                      <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>Amount Due</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>${(profile?.paymentTracking?.nextPaymentDue || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {customPackages[0].services?.map((s, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px' }}>
                        <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{s.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  {!profile?.paymentTracking?.isAdvancePaid && profile?.membershipId && (
                    <div className="list-item" style={{ borderLeft: '4px solid #ed8936', background: 'rgba(237, 137, 54, 0.05)' }}>
                      <div className="item-title">Initial 25% Advance</div>
                      <div className="item-amount">${(profile.membershipId.price * 0.25).toLocaleString()}</div>
                    </div>
                  )}
                  {pendingPayments.length === 0 ? (
                    <p className="no-data">No other pending payments</p>
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
              {packages.length === 0 && customPackages.length === 0 ? (
                <p className="no-data">No packages assigned yet</p>
              ) : (
                <div className="items-grid">
                  {/* Legacy Packages */}
                  {packages.map(p => (
                    <div key={p._id} className="item-card">
                      <h4 className="item-title">{p.packageName}</h4>
                      <p className="item-desc">{p.description}</p>
                      <div className="item-details">
                        <div className="detail">
                          <span className="label">Price:</span>
                          <span className="value">${p.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* New Custom Packages */}
                  {customPackages.map(p => (
                    <div key={p._id} className="item-card" style={{ border: '1px solid #8a2be2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 className="item-title">{p.packageName}</h4>
                        <span className="status-badge" style={{ background: '#8a2be2', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Custom</span>
                      </div>
                      <p className="item-desc">{p.description}</p>

                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#8a2be2' }}>Included Services</h5>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {p.services?.map((s, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                              <span><strong>{s.count}x</strong> {s.name}</span>
                              <span style={{ opacity: 0.7 }}>{s.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="item-details">
                        <div className="detail">
                          <span className="label">Price:</span>
                          <span className="value">${p.price}</span>
                        </div>
                        <div className="detail">
                          <span className="label">Next Bill Date:</span>
                          <span className="value">Every Month {p.billingDay || 27}th</span>
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

              {/* Upload Proof Section */}
              <div className="upload-proof-card" style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '2rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                <h3>Submit Bank Transfer Slip</h3>
                <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>If you paid via bank transfer, please upload the receipt/slip imaging (JPG, PNG, or PDF) for verification.</p>

                {uploadError && <div className="alert alert-error">{uploadError}</div>}
                {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}

                <form onSubmit={handleUploadProof} className="upload-form">
                  <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Payment Title</label>
                      <input
                        type="text"
                        placeholder="e.g. 25% Advance Payment"
                        value={payForm.title}
                        onChange={(e) => setPayForm({ ...payForm, title: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount Paid ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={payForm.amount}
                        onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Slip (Image or PDF)</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      style={{ color: 'white' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
                    <textarea
                      placeholder="Optional notes for admin..."
                      value={payForm.notes}
                      onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '80px' }}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isUploading}
                    style={{ background: '#8a2be2', color: 'white', padding: '1rem 2rem', borderRadius: '30px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s' }}
                  >
                    {isUploading ? 'Uploading...' : 'Submit Proof'}
                  </button>
                </form>
              </div>

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
                        <th>Slip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p._id} className={`status-${p.status}`}>
                          <td>{p.title}</td>
                          <td className="amount">${p.amount}</td>
                          <td>
                            <span className={`status-badge ${p.status}`} style={{
                              background: p.status === 'pending' ? '#ed8936' : p.status === 'paid' ? '#48bb78' : '#e53e3e'
                            }}>
                              {p.status}
                            </span>
                          </td>
                          <td>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            {p.slipUrl ? (
                              <a href={p.slipUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff', textDecoration: 'underline' }}>View Slip</a>
                            ) : '-'}
                          </td>
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