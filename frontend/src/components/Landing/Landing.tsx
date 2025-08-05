import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  return (
    <div className="landing-container">
      <div className="landing-background">
        <div className="landing-gradient"></div>
        <div className="landing-pattern"></div>
      </div>
      
      <div className="landing-content">
        {/* Header */}
        <header className="landing-header">
          <div className="landing-logo">
            <span className="landing-logo-icon">📊</span>
            <h1 className="landing-logo-text">BetTracker</h1>
          </div>
        </header>

        {/* Hero Section */}
        <main className="landing-hero">
          <div className="hero-content">
            <h2 className="hero-title">
              Track Your Bets.
              <br />
              <span className="hero-title-accent">Manage Your Bankroll.</span>
              <br />
              Bet Smarter.
            </h2>
            
            <p className="hero-description">
              The complete sports betting tracker and bankroll management tool. 
              Analyze your performance, identify winning strategies, and take control 
              of your betting journey.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary hero-cta">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary hero-login">
                Sign In
              </Link>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="hero-features">
            <div className="feature-card">
              <span className="feature-icon">📈</span>
              <h3 className="feature-title">Track Performance</h3>
              <p className="feature-description">
                Monitor your ROI, win rate, and betting trends with detailed analytics
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3 className="feature-title">Manage Bankroll</h3>
              <p className="feature-description">
                Set limits, track spending, and maintain disciplined betting habits
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3 className="feature-title">Improve Strategy</h3>
              <p className="feature-description">
                Identify your strengths and weaknesses to bet more intelligently
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Bets Tracked</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">$2M+</span>
              <span className="stat-label">Bankroll Managed</span>
            </div>
          </div>
          
          <p className="footer-tagline">
            Join the smart bettors using data to improve their game
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;