import React, {useEffect, useState} from 'react'
import API, { setAuthToken } from '../api'
import CreateCustomer from '../components/CreateCustomer'
import '../styles/admin-dashboard.css'


export default function AdminDashboard(){
  useEffect(()=>{ setAuthToken(localStorage.getItem('token')); },[])
  const [clients, setClients] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  const loadClients = () => {
    API.get('/clients')
      .then(r => setClients(r.data))
      .catch(err => console.error('Failed to load clients:', err))
  }

  useEffect(()=>{ loadClients() }, [])

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await API.delete(`/clients/${clientId}`)
        setClients(clients.filter(c => c._id !== clientId))
      } catch (err) {
        console.error('Failed to delete client:', err)
      }
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <button 
          className="btn-create-customer"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Close' : '+ Create Customer'}
        </button>
      </div>

      {showCreateForm && (
        <CreateCustomer onCustomerCreated={() => {
          loadClients()
          setShowCreateForm(false)
        }} />
      )}

      <div className="customers-section">
        <h3 className="section-title">All Customers ({clients.length})</h3>
        {clients.length === 0 ? (
          <p className="no-data">No customers yet. Create one to get started!</p>
        ) : (
          <div className="customers-grid">
            {clients.map(c => (
              <div key={c._id} className="customer-card">
                <div className="customer-info">
                  <h4 className="customer-name">{c.name || 'N/A'}</h4>
                  <p className="customer-id">ID: {c.clientId}</p>
                  <p className="customer-email">{c.email}</p>
                  {c.contact && <p className="customer-contact">{c.contact}</p>}
                  <span className={`status-badge status-${c.status || 'active'}`}>
                    {c.status || 'active'}
                  </span>
                </div>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteClient(c._id)}
                  title="Delete customer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}