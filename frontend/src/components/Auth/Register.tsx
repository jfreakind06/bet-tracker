import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, checkUsernameAvailability } from '../../services/api';
import './Auth.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | 'invalid' | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounced username check
  useEffect(() => {
    if (!username) {
      setUsernameStatus(null);
      setUsernameError('');
      return;
    }

    if (username.length < 3) {
      setUsernameStatus('invalid');
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setUsernameStatus('invalid');
      setUsernameError('Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameStatus('invalid');
      setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const result = await checkUsernameAvailability(username);
        if (result.available) {
          setUsernameStatus('available');
          setUsernameError('');
        } else {
          setUsernameStatus('taken');
          setUsernameError(result.error || 'Username not available');
        }
      } catch (err) {
        setUsernameStatus('invalid');
        setUsernameError('Failed to check username availability');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !username) {
      setError('Please fill in all fields');
      return;
    }

    if (usernameStatus !== 'available') {
      setError('Please choose a valid and available username');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await register(email, password, username);
      if (data.message) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed');
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
            Join thousands of bettors improving their game
          </p>
        </div>

        {/* Register Form */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Start tracking your bets today</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            {error && (
              <div className="auth-error" role="alert">
                <span className="auth-error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success" role="alert">
                <span className="auth-success-icon">✅</span>
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="username-input-wrapper">
                <input
                  id="username"
                  type="text"
                  className={`form-input ${
                    usernameStatus === 'available' ? 'success' : 
                    usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'error' : ''
                  }`}
                  placeholder="Choose a username (3-20 characters)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  disabled={loading}
                  autoComplete="username"
                  required
                  minLength={3}
                  maxLength={20}
                />
                <div className="username-status">
                  {usernameStatus === 'checking' && <span className="checking">⏳</span>}
                  {usernameStatus === 'available' && <span className="available">✅</span>}
                  {usernameStatus === 'taken' && <span className="taken">❌</span>}
                  {usernameStatus === 'invalid' && <span className="invalid">⚠️</span>}
                </div>
              </div>
              {usernameError && (
                <p className="username-error">{usernameError}</p>
              )}
            </div>

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
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="btn btn-secondary auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
