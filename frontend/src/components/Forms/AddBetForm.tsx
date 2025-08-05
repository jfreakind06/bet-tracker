import React, { useState, useEffect } from 'react';
import './AddBetForm.css';

interface BetFormData {
  date: string;
  description: string;
  amountRisked: string;
  odds: string;
  result: string;
  payout: string;
  betType: string;
  sport: string;
  notes: string;
}

interface AddBetFormProps {
  onSubmit: (data: BetFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AddBetForm: React.FC<AddBetFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<BetFormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amountRisked: '',
    odds: '',
    result: '',
    payout: '',
    betType: 'single',
    sport: '',
    notes: ''
  });
  const [calculatedPayout, setCalculatedPayout] = useState<number>(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const betTypes = [
    { value: 'single', label: 'Single Bet' },
    { value: 'parlay', label: 'Parlay' },
    { value: 'teaser', label: 'Teaser' },
    { value: 'prop', label: 'Prop Bet' },
    { value: 'future', label: 'Future' },
    { value: 'live', label: 'Live Bet' }
  ];

  const sports = [
    { value: 'nfl', label: 'NFL' },
    { value: 'nba', label: 'NBA' },
    { value: 'mlb', label: 'MLB' },
    { value: 'nhl', label: 'NHL' },
    { value: 'ncaaf', label: 'College Football' },
    { value: 'ncaab', label: 'College Basketball' },
    { value: 'soccer', label: 'Soccer' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'golf', label: 'Golf' },
    { value: 'mma', label: 'MMA/Boxing' },
    { value: 'other', label: 'Other' }
  ];

  const resultOptions = [
    { value: '', label: 'Pending', icon: '⏳' },
    { value: 'win', label: 'Win', icon: '✅' },
    { value: 'loss', label: 'Loss', icon: '❌' },
    { value: 'push', label: 'Push', icon: '➖' }
  ];

  // Auto-calculate payout when odds, amount, or result changes
  useEffect(() => {
    const amount = parseFloat(form.amountRisked);
    const odds = parseFloat(form.odds);

    if (!isNaN(amount) && !isNaN(odds) && amount > 0) {
      let payout = 0;
      
      if (odds > 0) {
        // Positive odds (e.g., +150)
        payout = amount + (amount * odds) / 100;
      } else if (odds < 0) {
        // Negative odds (e.g., -110)
        payout = amount + (amount * 100) / Math.abs(odds);
      }
      
      setCalculatedPayout(payout);
      
      // Auto-set payout if win is selected
      if (form.result === 'win') {
        setForm(prev => ({ ...prev, payout: payout.toFixed(2) }));
      } else if (form.result === 'loss') {
        setForm(prev => ({ ...prev, payout: '0' }));
      } else if (form.result === 'push') {
        setForm(prev => ({ ...prev, payout: amount.toFixed(2) }));
      }
    }
  }, [form.amountRisked, form.odds, form.result]);

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1:
        if (!form.description.trim()) {
          newErrors.description = 'Bet description is required';
        }
        if (!form.sport) {
          newErrors.sport = 'Please select a sport';
        }
        if (!form.betType) {
          newErrors.betType = 'Please select a bet type';
        }
        break;
      
      case 2:
        if (!form.amountRisked || parseFloat(form.amountRisked) <= 0) {
          newErrors.amountRisked = 'Please enter a valid amount';
        }
        if (!form.odds || isNaN(parseFloat(form.odds))) {
          newErrors.odds = 'Please enter valid odds';
        }
        if (!form.date) {
          newErrors.date = 'Please select a date';
        }
        break;
      
      case 3:
        if (form.result && form.result !== '' && (!form.payout || parseFloat(form.payout) < 0)) {
          newErrors.payout = 'Please enter a valid payout amount';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3) && validateStep(2) && validateStep(1)) {
      onSubmit(form);
    }
  };

  const handleInputChange = (field: keyof BetFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Bet Details';
      case 2:
        return 'Wager Information';
      case 3:
        return 'Result & Notes';
      default:
        return 'Add Bet';
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`step-indicator__item ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          <div className="step-indicator__circle">
            {currentStep > step ? '✓' : step}
          </div>
          <span className="step-indicator__label">
            {step === 1 ? 'Details' : step === 2 ? 'Wager' : 'Result'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="add-bet-form">
      <div className="add-bet-form__header">
        <h2 className="add-bet-form__title">{getStepTitle()}</h2>
        {renderStepIndicator()}
      </div>

      <form onSubmit={handleSubmit} className="add-bet-form__form">
        {/* Step 1: Bet Details */}
        {currentStep === 1 && (
          <div className="form-step fade-in">
            <div className="form-group">
              <label className="form-label">
                What are you betting on? *
              </label>
              <input
                type="text"
                className={`form-input ${errors.description ? 'error' : ''}`}
                placeholder="e.g., Lakers vs Warriors - Lakers +5.5"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Sport *</label>
              <select
                className={`form-select ${errors.sport ? 'error' : ''}`}
                value={form.sport}
                onChange={(e) => handleInputChange('sport', e.target.value)}
              >
                <option value="">Select sport...</option>
                {sports.map(sport => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
              {errors.sport && <span className="form-error">{errors.sport}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Bet Type *</label>
              <select
                className={`form-select ${errors.betType ? 'error' : ''}`}
                value={form.betType}
                onChange={(e) => handleInputChange('betType', e.target.value)}
              >
                {betTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.betType && <span className="form-error">{errors.betType}</span>}
            </div>
          </div>
        )}

        {/* Step 2: Wager Information */}
        {currentStep === 2 && (
          <div className="form-step fade-in">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className={`form-input ${errors.date ? 'error' : ''}`}
                value={form.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount Risked *</label>
                <div className="input-with-symbol">
                  <span className="input-symbol">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`form-input ${errors.amountRisked ? 'error' : ''}`}
                    placeholder="100.00"
                    value={form.amountRisked}
                    onChange={(e) => handleInputChange('amountRisked', e.target.value)}
                  />
                </div>
                {errors.amountRisked && <span className="form-error">{errors.amountRisked}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Odds *</label>
                <input
                  type="number"
                  className={`form-input ${errors.odds ? 'error' : ''}`}
                  placeholder="-110 or +150"
                  value={form.odds}
                  onChange={(e) => handleInputChange('odds', e.target.value)}
                />
                {errors.odds && <span className="form-error">{errors.odds}</span>}
              </div>
            </div>

            {calculatedPayout > 0 && (
              <div className="payout-preview">
                <div className="payout-preview__content">
                  <span className="payout-preview__label">Potential Payout:</span>
                  <span className="payout-preview__amount">${calculatedPayout.toFixed(2)}</span>
                </div>
                <div className="payout-preview__profit">
                  Profit: ${(calculatedPayout - parseFloat(form.amountRisked || '0')).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Result & Notes */}
        {currentStep === 3 && (
          <div className="form-step fade-in">
            <div className="form-group">
              <label className="form-label">Bet Result</label>
              <div className="result-options">
                {resultOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`result-option ${form.result === option.value ? 'active' : ''}`}
                    onClick={() => handleInputChange('result', option.value)}
                  >
                    <span className="result-option__icon">{option.icon}</span>
                    <span className="result-option__label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.result && form.result !== '' && (
              <div className="form-group">
                <label className="form-label">
                  {form.result === 'win' ? 'Total Payout' : form.result === 'push' ? 'Amount Returned' : 'Loss Amount'}
                </label>
                <div className="input-with-symbol">
                  <span className="input-symbol">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`form-input ${errors.payout ? 'error' : ''}`}
                    value={form.payout}
                    onChange={(e) => handleInputChange('payout', e.target.value)}
                  />
                </div>
                {errors.payout && <span className="form-error">{errors.payout}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add any additional notes about this bet..."
                rows={3}
                value={form.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Form Navigation */}
        <div className="form-navigation">
          <div className="form-navigation__left">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={prevStep}
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="form-navigation__right">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                    Adding Bet...
                  </>
                ) : (
                  'Add Bet'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBetForm;