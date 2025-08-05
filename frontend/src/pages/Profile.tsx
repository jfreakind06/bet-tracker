import React, { useState } from 'react';
import BankrollManager from '../components/Bankroll/BankrollManager';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bankroll' | 'settings' | 'account'>('bankroll');
  
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      // Trigger storage event for App component
      window.dispatchEvent(new Event('storage'));
      window.location.href = '/';
    }
  };

  const mockStats = {
    totalWagered: 2500,
    netProfit: 150,
    dailyWagered: 50,
    weeklyWagered: 300,
    monthlyWagered: 1200
  };

  const renderBankrollTab = () => (
    <BankrollManager 
      currentStats={mockStats}
      onSettingsChange={(settings) => {
        console.log('Bankroll settings updated:', settings);
        // Could save to backend here
      }}
    />
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Betting Preferences</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Odds Format</label>
            <select className="form-select">
              <option value="american">American (-110, +150)</option>
              <option value="decimal">Decimal (1.91, 2.50)</option>
              <option value="fractional">Fractional (10/11, 3/2)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Default Currency</label>
            <select className="form-select">
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Time Zone</label>
            <select className="form-select">
              <option value="est">Eastern (EST)</option>
              <option value="cst">Central (CST)</option>
              <option value="mst">Mountain (MST)</option>
              <option value="pst">Pacific (PST)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Bet Results</h3>
              <p className="text-sm text-secondary">Get notified when your bets are settled</p>
            </div>
            <input type="checkbox" defaultChecked className="form-checkbox" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Daily Summary</h3>
              <p className="text-sm text-secondary">Daily recap of your betting activity</p>
            </div>
            <input type="checkbox" defaultChecked className="form-checkbox" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Limit Warnings</h3>
              <p className="text-sm text-secondary">Alerts when approaching your limits</p>
            </div>
            <input type="checkbox" defaultChecked className="form-checkbox" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Data Management</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="btn btn-secondary">
              📤 Export Data
            </button>
            <button className="btn btn-secondary">
              📥 Import Data
            </button>
          </div>
          <p className="text-xs text-secondary">
            Export your betting history or import data from other platforms
          </p>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Account Information</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="your@email.com"
              disabled
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Your display name"
            />
          </div>
          
          <button className="btn btn-primary">
            Update Account
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Security</h2>
        </div>
        <div className="card-body space-y-4">
          <button className="btn btn-secondary">
            🔒 Change Password
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body text-center">
          <h3 className="font-semibold mb-2 text-error">Danger Zone</h3>
          <p className="text-sm text-secondary mb-4">
            This action cannot be undone
          </p>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="fade-in">
        <header className="p-4">
          <h1 className="text-2xl font-bold text-center">Profile & Settings</h1>
          <p className="text-center text-secondary mt-2">
            Manage your account, bankroll, and betting preferences
          </p>
        </header>

        {/* Tabs */}
        <div className="p-4">
          <div className="flex justify-center mb-6">
            <div className="flex bg-secondary rounded-lg p-1 border border-border-color">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'bankroll'
                    ? 'bg-primary-color text-white shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
                onClick={() => setActiveTab('bankroll')}
              >
                💰 Bankroll
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-primary-color text-white shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'account'
                    ? 'bg-primary-color text-white shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
                onClick={() => setActiveTab('account')}
              >
                👤 Account
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'bankroll' && renderBankrollTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'account' && renderAccountTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;