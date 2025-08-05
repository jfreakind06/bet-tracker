import React, { useState, useEffect } from 'react';
import './BankrollManager.css';

interface BankrollSettings {
  startingBankroll: number;
  currentBankroll: number;
  unitSize: number;
  unitCalculationMethod: 'fixed' | 'percentage';
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  maxBetSize: number;
  stopLossLimit: number;
  targetProfit: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

interface BankrollManagerProps {
  onSettingsChange?: (settings: BankrollSettings) => void;
  currentStats?: {
    totalWagered: number;
    netProfit: number;
    dailyWagered: number;
    weeklyWagered: number;
    monthlyWagered: number;
  };
}

const BankrollManager: React.FC<BankrollManagerProps> = ({ 
  onSettingsChange,
  currentStats = {
    totalWagered: 0,
    netProfit: 0,
    dailyWagered: 0,
    weeklyWagered: 0,
    monthlyWagered: 0
  }
}) => {
  const [settings, setSettings] = useState<BankrollSettings>({
    startingBankroll: 1000,
    currentBankroll: 1000,
    unitSize: 10,
    unitCalculationMethod: 'fixed',
    dailyLimit: 100,
    weeklyLimit: 500,
    monthlyLimit: 2000,
    maxBetSize: 50,
    stopLossLimit: 200,
    targetProfit: 500,
    riskTolerance: 'moderate'
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'limits' | 'goals'>('calculator');
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('bankrollSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse bankroll settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bankrollSettings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof BankrollSettings>(
    key: K, 
    value: BankrollSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Auto-calculate unit size if percentage method is selected
      if (key === 'currentBankroll' || key === 'unitCalculationMethod') {
        if (newSettings.unitCalculationMethod === 'percentage') {
          const percentage = getRiskPercentage(newSettings.riskTolerance);
          newSettings.unitSize = Math.round(newSettings.currentBankroll * percentage);
        }
      }
      
      return newSettings;
    });
  };

  const getRiskPercentage = (tolerance: BankrollSettings['riskTolerance']): number => {
    switch (tolerance) {
      case 'conservative': return 0.01; // 1%
      case 'moderate': return 0.02; // 2%
      case 'aggressive': return 0.05; // 5%
      default: return 0.02;
    }
  };

  const calculateRecommendedUnitSize = (): number => {
    const percentage = getRiskPercentage(settings.riskTolerance);
    return Math.round(settings.currentBankroll * percentage);
  };

  const getWarningLevel = (current: number, limit: number): 'safe' | 'warning' | 'danger' => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'safe';
  };

  const renderCalculatorTab = () => (
    <div className="bankroll-section">
      <div className="bankroll-grid">
        <div className="bankroll-card">
          <h3 className="bankroll-card__title">Current Bankroll</h3>
          <div className="form-group">
            <label className="form-label">Starting Bankroll</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.startingBankroll}
                onChange={(e) => updateSetting('startingBankroll', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Current Bankroll</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.currentBankroll}
                onChange={(e) => updateSetting('currentBankroll', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="bankroll-change">
              {settings.currentBankroll > settings.startingBankroll ? (
                <span className="bankroll-change--positive">
                  +${(settings.currentBankroll - settings.startingBankroll).toFixed(2)} 
                  (+{(((settings.currentBankroll / settings.startingBankroll) - 1) * 100).toFixed(1)}%)
                </span>
              ) : (
                <span className="bankroll-change--negative">
                  -${(settings.startingBankroll - settings.currentBankroll).toFixed(2)} 
                  ({(((settings.currentBankroll / settings.startingBankroll) - 1) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bankroll-card">
          <h3 className="bankroll-card__title">Unit Size Calculator</h3>
          <div className="form-group">
            <label className="form-label">Calculation Method</label>
            <select
              className="form-select"
              value={settings.unitCalculationMethod}
              onChange={(e) => updateSetting('unitCalculationMethod', e.target.value as 'fixed' | 'percentage')}
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage of Bankroll</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Risk Tolerance</label>
            <select
              className="form-select"
              value={settings.riskTolerance}
              onChange={(e) => updateSetting('riskTolerance', e.target.value as BankrollSettings['riskTolerance'])}
            >
              <option value="conservative">Conservative (1%)</option>
              <option value="moderate">Moderate (2%)</option>
              <option value="aggressive">Aggressive (5%)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Unit Size</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.unitSize}
                onChange={(e) => updateSetting('unitSize', parseFloat(e.target.value) || 0)}
                disabled={settings.unitCalculationMethod === 'percentage'}
              />
            </div>
            {settings.unitCalculationMethod === 'percentage' && (
              <div className="unit-calculation">
                Auto-calculated: {getRiskPercentage(settings.riskTolerance) * 100}% of bankroll
              </div>
            )}
            {settings.unitCalculationMethod === 'fixed' && (
              <div className="unit-recommendation">
                Recommended: ${calculateRecommendedUnitSize()} 
                ({getRiskPercentage(settings.riskTolerance) * 100}% of bankroll)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="unit-size-info">
        <h4>Unit Size Guidelines</h4>
        <div className="guidelines-grid">
          <div className="guideline-item">
            <span className="guideline-label">Conservative (1-2%):</span>
            <span className="guideline-desc">Lower risk, steady growth</span>
          </div>
          <div className="guideline-item">
            <span className="guideline-label">Moderate (2-3%):</span>
            <span className="guideline-desc">Balanced risk and reward</span>
          </div>
          <div className="guideline-item">
            <span className="guideline-label">Aggressive (5%+):</span>
            <span className="guideline-desc">Higher variance, bigger swings</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLimitsTab = () => (
    <div className="bankroll-section">
      <div className="bankroll-grid">
        <div className="bankroll-card">
          <h3 className="bankroll-card__title">Wagering Limits</h3>
          
          <div className="form-group">
            <label className="form-label">Daily Limit</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.dailyLimit}
                onChange={(e) => updateSetting('dailyLimit', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className={`limit-progress limit-progress--${getWarningLevel(currentStats.dailyWagered, settings.dailyLimit)}`}>
              <div className="limit-progress__bar">
                <div 
                  className="limit-progress__fill"
                  style={{ width: `${Math.min((currentStats.dailyWagered / settings.dailyLimit) * 100, 100)}%` }}
                />
              </div>
              <span className="limit-progress__text">
                ${currentStats.dailyWagered.toFixed(2)} / ${settings.dailyLimit.toFixed(2)} today
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Weekly Limit</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.weeklyLimit}
                onChange={(e) => updateSetting('weeklyLimit', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className={`limit-progress limit-progress--${getWarningLevel(currentStats.weeklyWagered, settings.weeklyLimit)}`}>
              <div className="limit-progress__bar">
                <div 
                  className="limit-progress__fill"
                  style={{ width: `${Math.min((currentStats.weeklyWagered / settings.weeklyLimit) * 100, 100)}%` }}
                />
              </div>
              <span className="limit-progress__text">
                ${currentStats.weeklyWagered.toFixed(2)} / ${settings.weeklyLimit.toFixed(2)} this week
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.monthlyLimit}
                onChange={(e) => updateSetting('monthlyLimit', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className={`limit-progress limit-progress--${getWarningLevel(currentStats.monthlyWagered, settings.monthlyLimit)}`}>
              <div className="limit-progress__bar">
                <div 
                  className="limit-progress__fill"
                  style={{ width: `${Math.min((currentStats.monthlyWagered / settings.monthlyLimit) * 100, 100)}%` }}
                />
              </div>
              <span className="limit-progress__text">
                ${currentStats.monthlyWagered.toFixed(2)} / ${settings.monthlyLimit.toFixed(2)} this month
              </span>
            </div>
          </div>
        </div>

        <div className="bankroll-card">
          <h3 className="bankroll-card__title">Risk Management</h3>
          
          <div className="form-group">
            <label className="form-label">Maximum Bet Size</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.maxBetSize}
                onChange={(e) => updateSetting('maxBetSize', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="recommendation">
              Recommended: {Math.round(settings.unitSize * 3)} (3x unit size)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Stop Loss Limit</label>
            <div className="input-with-symbol">
              <span className="input-symbol">$</span>
              <input
                type="number"
                className="form-input"
                value={settings.stopLossLimit}
                onChange={(e) => updateSetting('stopLossLimit', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="recommendation">
              Consider taking a break if you lose this amount in a session
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="bankroll-section">
      <div className="bankroll-card">
        <h3 className="bankroll-card__title">Profit Goals</h3>
        
        <div className="form-group">
          <label className="form-label">Target Profit</label>
          <div className="input-with-symbol">
            <span className="input-symbol">$</span>
            <input
              type="number"
              className="form-input"
              value={settings.targetProfit}
              onChange={(e) => updateSetting('targetProfit', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="goal-progress">
          <div className="goal-progress__header">
            <span>Progress to Goal</span>
            <span>{currentStats.netProfit >= settings.targetProfit ? '🎯' : '📈'}</span>
          </div>
          <div className="goal-progress__bar">
            <div 
              className="goal-progress__fill"
              style={{ 
                width: `${Math.min((currentStats.netProfit / settings.targetProfit) * 100, 100)}%`,
                backgroundColor: currentStats.netProfit >= 0 ? 'var(--success-color)' : 'var(--error-color)'
              }}
            />
          </div>
          <div className="goal-progress__stats">
            <span>
              Current: ${currentStats.netProfit.toFixed(2)}
            </span>
            <span>
              Target: ${settings.targetProfit.toFixed(2)}
            </span>
          </div>
          <div className="goal-progress__remaining">
            {currentStats.netProfit >= settings.targetProfit ? (
              <span className="text-success">🎉 Goal achieved! Consider setting a new target.</span>
            ) : (
              <span className="text-muted">
                ${(settings.targetProfit - currentStats.netProfit).toFixed(2)} remaining to reach your goal
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bankroll-manager">
      <div className="bankroll-manager__header">
        <h2 className="bankroll-manager__title">Bankroll Management</h2>
        <p className="bankroll-manager__subtitle">
          Set limits, calculate unit sizes, and track your betting goals
        </p>
      </div>

      <div className="bankroll-tabs">
        <button
          className={`bankroll-tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          📊 Calculator
        </button>
        <button
          className={`bankroll-tab ${activeTab === 'limits' ? 'active' : ''}`}
          onClick={() => setActiveTab('limits')}
        >
          🛡️ Limits
        </button>
        <button
          className={`bankroll-tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 Goals
        </button>
      </div>

      <div className="bankroll-content">
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'limits' && renderLimitsTab()}
        {activeTab === 'goals' && renderGoalsTab()}
      </div>
    </div>
  );
};

export default BankrollManager;