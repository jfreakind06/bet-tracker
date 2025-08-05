import React from 'react';

interface Bet {
  id: number;
  date: string;
  description: string;
  amount_risked: number;
  odds: number;
  result: string;
  payout: number;
}

interface RecentActivityProps {
  bets: Bet[];
  limit?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ bets, limit = 5 }) => {
  const recentBets = bets.slice(0, limit);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win':
        return '✅';
      case 'loss':
        return '❌';
      case 'push':
        return '➖';
      default:
        return '⏳';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win':
        return 'var(--success-color)';
      case 'loss':
        return 'var(--error-color)';
      case 'push':
        return 'var(--text-muted)';
      default:
        return 'var(--warning-color)';
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  if (recentBets.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <p className="text-secondary mb-2">No recent activity</p>
            <p className="text-xs text-muted">
              Your recent bets will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <button 
          className="text-xs text-primary hover:underline"
          onClick={() => window.location.href = '/bets'}
        >
          View All
        </button>
      </div>
      <div className="card-body p-0">
        <div className="divide-y divide-border-color">
          {recentBets.map((bet) => (
            <div key={bet.id} className="p-4 hover:bg-tertiary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-sm"
                      style={{ color: getResultColor(bet.result) }}
                      role="img" 
                      aria-label={bet.result || 'pending'}
                    >
                      {getResultIcon(bet.result)}
                    </span>
                    <h3 className="font-medium text-sm text-primary truncate">
                      {bet.description}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-secondary">
                    <span>{formatDate(bet.date)}</span>
                    <span>${bet.amount_risked} @ {formatOdds(bet.odds)}</span>
                  </div>
                </div>
                <div className="text-right ml-2">
                  {bet.result === 'win' && (
                    <div className="text-sm font-medium text-success">
                      +${bet.payout.toFixed(2)}
                    </div>
                  )}
                  {bet.result === 'loss' && (
                    <div className="text-sm font-medium text-error">
                      -${bet.amount_risked.toFixed(2)}
                    </div>
                  )}
                  {bet.result === 'push' && (
                    <div className="text-sm font-medium text-muted">
                      Push
                    </div>
                  )}
                  {!bet.result && (
                    <div className="text-xs text-secondary">
                      Open
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;