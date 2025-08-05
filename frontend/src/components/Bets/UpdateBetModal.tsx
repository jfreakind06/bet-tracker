import React, { useState } from 'react';
import { updateBet } from '../../services/api';
import './UpdateBetModal.css';

interface Bet {
  id: number;
  date: string;
  description: string;
  amount_risked: number;
  odds: number;
  result: string;
  payout: number;
}

interface UpdateBetModalProps {
  bet: Bet;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedBet: Bet) => void;
}

const UpdateBetModal: React.FC<UpdateBetModalProps> = ({
  bet,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [result, setResult] = useState(bet.result || '');
  const [customPayout, setCustomPayout] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingResult, setPendingResult] = useState('');

  if (!isOpen) return null;

  const calculatePotentialPayout = () => {
    if (bet.odds >= 0) {
      // American positive odds (+150 = bet 100 to win 150)
      return bet.amount_risked + (bet.amount_risked * bet.odds / 100);
    } else {
      // American negative odds (-110 = bet 110 to win 100)
      return bet.amount_risked + (bet.amount_risked * 100 / Math.abs(bet.odds));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) {
      setError('Please select a result');
      return;
    }

    // Show confirmation for win/loss bets
    if (result === 'win' || result === 'loss') {
      setPendingResult(result);
      setShowConfirmation(true);
      return;
    }

    // For push bets, update immediately (no confirmation needed)
    setLoading(true);
    setError('');

    try {
      const payoutValue = customPayout ? parseFloat(customPayout) : undefined;
      const updatedBetData = await updateBet(bet.id, result, payoutValue);
      
      if (updatedBetData.error) {
        setError(updatedBetData.error);
      } else {
        onUpdate(updatedBetData);
        onClose();
      }
    } catch (err) {
      setError('Failed to update bet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpdate = async () => {
    setLoading(true);
    setError('');

    try {
      const payoutValue = customPayout ? parseFloat(customPayout) : undefined;
      const updatedBetData = await updateBet(bet.id, pendingResult, payoutValue);
      
      if (updatedBetData.error) {
        setError(updatedBetData.error);
        setShowConfirmation(false);
      } else {
        onUpdate(updatedBetData);
        onClose();
      }
    } catch (err) {
      setError('Failed to update bet. Please try again.');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingResult('');
    setError('');
  };

  const handleClose = () => {
    setResult(bet.result || '');
    setCustomPayout('');
    setError('');
    setShowConfirmation(false);
    setPendingResult('');
    onClose();
  };

  return (
    <div className="update-bet-modal-overlay" onClick={handleClose}>
      <div className="update-bet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="update-bet-modal-header">
          <h3 className="update-bet-modal-title">Update Bet Result</h3>
          <button 
            className="update-bet-modal-close" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="update-bet-modal-content">
          {/* Bet Summary */}
          <div className="bet-summary">
            <h4 className="bet-summary-title">{bet.description}</h4>
            <div className="bet-summary-details">
              <span className="bet-detail">
                <strong>Date:</strong> {new Date(bet.date).toLocaleDateString()}
              </span>
              <span className="bet-detail">
                <strong>Stake:</strong> ${bet.amount_risked.toFixed(2)}
              </span>
              <span className="bet-detail">
                <strong>Odds:</strong> {bet.odds > 0 ? '+' : ''}{bet.odds}
              </span>
              <span className="bet-detail">
                <strong>Potential Payout:</strong> ${calculatePotentialPayout().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirmation && (
            <div className="confirmation-dialog">
              <div className="confirmation-content">
                <div className="confirmation-icon">
                  {pendingResult === 'win' ? '🎉' : '❌'}
                </div>
                <h4 className="confirmation-title">
                  Confirm Bet Result
                </h4>
                <p className="confirmation-message">
                  Are you sure you want to mark this bet as a <strong>{pendingResult}</strong>?
                </p>
                <div className="confirmation-details">
                  <span className="confirmation-bet">{bet.description}</span>
                  {pendingResult === 'win' && (
                    <span className="confirmation-payout">
                      You'll {pendingResult === 'win' ? 'win' : 'lose'}: ${pendingResult === 'win' 
                        ? (customPayout ? parseFloat(customPayout) : calculatePotentialPayout()).toFixed(2)
                        : bet.amount_risked.toFixed(2)
                      }
                    </span>
                  )}
                  {pendingResult === 'loss' && (
                    <span className="confirmation-payout">
                      You'll lose your stake: ${bet.amount_risked.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="confirmation-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelConfirmation}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn ${pendingResult === 'win' ? 'btn-success' : 'btn-error'}`}
                    onClick={handleConfirmUpdate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        {pendingResult === 'win' ? '🎉' : '❌'} Confirm {pendingResult === 'win' ? 'Win' : 'Loss'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showConfirmation && (
          <form onSubmit={handleSubmit} className="update-bet-form">
            {error && (
              <div className="form-error" role="alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Result Selection */}
            <div className="form-group">
              <label className="form-label">
                <strong>Result *</strong>
              </label>
              <div className="result-options">
                <label className="result-option">
                  <input
                    type="radio"
                    name="result"
                    value="win"
                    checked={result === 'win'}
                    onChange={(e) => setResult(e.target.value)}
                    disabled={loading}
                  />
                  <span className="result-option-label win">
                    🎉 Win
                  </span>
                </label>
                
                <label className="result-option">
                  <input
                    type="radio"
                    name="result"
                    value="loss"
                    checked={result === 'loss'}
                    onChange={(e) => setResult(e.target.value)}
                    disabled={loading}
                  />
                  <span className="result-option-label loss">
                    ❌ Loss
                  </span>
                </label>
                
                <label className="result-option">
                  <input
                    type="radio"
                    name="result"
                    value="push"
                    checked={result === 'push'}
                    onChange={(e) => setResult(e.target.value)}
                    disabled={loading}
                  />
                  <span className="result-option-label push">
                    🤝 Push
                  </span>
                </label>
              </div>
            </div>

            {/* Custom Payout (Optional) */}
            {result === 'win' && (
              <div className="form-group">
                <label htmlFor="customPayout" className="form-label">
                  Custom Payout (Optional)
                </label>
                <input
                  id="customPayout"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder={`Auto: $${calculatePotentialPayout().toFixed(2)}`}
                  value={customPayout}
                  onChange={(e) => setCustomPayout(e.target.value)}
                  disabled={loading}
                />
                <small className="form-help">
                  Leave empty to auto-calculate based on odds
                </small>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading || !result}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  'Update Bet'
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateBetModal;