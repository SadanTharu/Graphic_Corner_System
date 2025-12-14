import React, { useEffect, useState } from 'react'
import '../styles/admin-services.css'

export default function AdminServices(){
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices(){
      try{
        const res = await fetch('/api/services/admin', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if(res.ok){
          const data = await res.json()
          setServices(data)
        } else {
          console.error('Failed to fetch services')
        }
      } catch(err){
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  return (
    <div className="admin-services">
      <h2>Service Management</h2>
      <div className="admin-actions">
        <button className="btn-primary">Create Service</button>
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <table className="services-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services && services.length ? services.map(s => (
              <tr key={s._id}>
                <td>{s.title}</td>
                <td>{s.category || '—'}</td>
                <td>{s.price}</td>
                <td>
                  <button className="btn">Edit</button>
                  <button className="btn danger">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4">No services found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
