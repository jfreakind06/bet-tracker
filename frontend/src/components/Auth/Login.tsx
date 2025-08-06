import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Trigger storage event for App component
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      } else {
        setError(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>
      
      <div className="auth-content">
        {/* App Branding */}
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">📊</span>
            <h1 className="auth-logo-text">BetTracker</h1>
          </div>
          <p className="auth-tagline">
            Track your bets, manage your bankroll, bet smarter
          </p>
        </div>

        {/* Login Form */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            {error && (
              <div className="auth-error" role="alert">
                <span className="auth-error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary auth-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <Link to="/register" className="btn btn-secondary auth-link">
            Create Account
          </Link>
        </div>

        {/* Demo Credentials (for development) */}
        <div className="auth-demo">
          <p className="auth-demo-title">Demo Credentials:</p>
          <p className="auth-demo-text">Email: demo@example.com</p>
          <p className="auth-demo-text">Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
