import React from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import API, { setAuthToken } from '../api'
import '../styles/auth.css'


function Login() {
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const form = new FormData(e.target);
      const loginId = form.get('loginId');
      const password = form.get('password');
      const res = await API.post('/auth/login', { loginId, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('clientId', res.data.clientId);
      localStorage.setItem('name', res.data.name);
      setAuthToken(res.data.token);
      if (res.data.role === 'admin') navigate('/admin');
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
            <label className="auth-label">Email or Username</label>
            <input
              name="loginId"
              type="text"
              placeholder="Enter your email or username"
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
        <p className="auth-footer-text">
          Don't have an account? <Link to="/auth/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}

function Register() {
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const form = new FormData(e.target);
      const data = Object.fromEntries(form.entries());

      await API.post('/auth/register', data);
      navigate('/auth/login', { state: { message: 'Account created! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3 className="auth-title">Join Us</h3>
        <p className="auth-subtitle">Create a new customer account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">Full Name</label>
            <input name="name" type="text" className="auth-input" required />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Username</label>
            <input name="username" type="text" className="auth-input" required />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input name="email" type="email" className="auth-input" required />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input name="password" type="password" className="auth-input" required />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function AuthPages() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Routes>
  )
}
