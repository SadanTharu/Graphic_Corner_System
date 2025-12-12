import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import API, { setAuthToken } from '../api'
import '../styles/auth.css'


function Login(){
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  async function submit(e){
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const form = new FormData(e.target);
      const email = form.get('email');
      const password = form.get('password');
      const res = await API.post('/auth/login', {email, password});
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('clientId', res.data.clientId);
      setAuthToken(res.data.token);
      if(res.data.role==='admin') navigate('/admin'); 
      else navigate('/client');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3 className="auth-title">Welcome Back</h3>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={submit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input 
              name="email" 
              type="email"
              placeholder="Enter your email" 
              className="auth-input"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input 
              name="password" 
              type="password"
              placeholder="Enter your password" 
              className="auth-input"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-link" style={{marginTop: '1rem'}}>
          Demo: admin@local / MySecretAdminPassword123
        </p>
      </div>
    </div>
  )
}


export default function AuthPages(){
  return (
    <Routes>
      <Route path="login" element={<Login/>} />
    </Routes>
  )
}