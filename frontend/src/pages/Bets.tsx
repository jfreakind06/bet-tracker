import React, { useState, useEffect } from 'react';
import { getBets } from '../services/api';
import UpdateBetModal from '../components/Bets/UpdateBetModal';

interface Bet {
  id: number;
  date: string;
  description: string;
  amount_risked: number;
  odds: number;
  result: string;
  payout: number;
  sport?: string;
  betType?: string;
}

const Bets: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'win' | 'loss' | 'push'>('all');
  

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const data = await getBets();
      if (data.error) {
        console.error('Failed to fetch bets:', data.error);
      } else {
        setBets(data as Bet[]);
      }
    } catch (err) {
      console.error('Failed to fetch bets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBet = (bet: Bet) => {
    setSelectedBet(bet);
    setUpdateModalOpen(true);
  };

  const handleBetUpdated = async () => {
    await fetchBets();
    setUpdateModalOpen(false);
    setSelectedBet(null);
  };

  const getFilteredBets = () => {
    if (filter === 'all') return bets;
    if (filter === 'pending') return bets.filter(bet => !bet.result || bet.result === '');
    return bets.filter(bet => bet.result === filter);
  };

  const filteredBets = getFilteredBets();

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-success';
      case 'loss': return 'text-error';
      case 'push': return 'text-warning';
      default: return 'text-muted';
    }
  };

  const getResultDisplay = (result: string) => {
    if (!result || result === '') return 'Pending';
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-secondary">Loading bets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="fade-in">
        <header className="p-4">
          <h1 className="text-2xl font-bold text-center">My Bets</h1>
          <p className="text-center text-secondary mt-2">
            Complete betting history and management
          </p>
        </header>
        
        <div className="p-4">
          {/* Filter Buttons - Mobile Friendly */}
          <div className="mb-6">
            {/* Scroll hint indicator */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Filter by status</h3>
              <div className="text-xs text-gray-500 sm:hidden">
                Swipe to see more →
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-4 min-w-max px-1">
                {[
                  { key: 'all', label: 'All Bets', icon: '📊' },
                  { key: 'pending', label: 'Pending', icon: '⏳' },
                  { key: 'win', label: 'Wins', icon: '✅' },
                  { key: 'loss', label: 'Losses', icon: '❌' },
                  { key: 'push', label: 'Pushes', icon: '↔️' }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                      filter === filterOption.key
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 hover:shadow-md'
                    }`}
                    onClick={() => setFilter(filterOption.key as typeof filter)}
                  >
                    <span className="text-base">{filterOption.icon}</span>
                    <span>
                      {filterOption.label} ({
                        filterOption.key === 'all' 
                          ? bets.length 
                          : filterOption.key === 'pending'
                            ? bets.filter(b => !b.result || b.result === '').length
                            : bets.filter(b => b.result === filterOption.key).length
                      })
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bets List */}
          {filteredBets.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-8">
                <p className="text-secondary">No bets found for the selected filter.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBets.map(bet => (
                <div key={bet.id} className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{bet.description}</h3>
                        <p className="text-sm text-secondary">{bet.sport} • {bet.betType}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getResultColor(bet.result)}`}>
                          {getResultDisplay(bet.result)}
                        </p>
                        <p className="text-sm text-secondary">{new Date(bet.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted">Amount Risked</p>
                        <p className="font-medium">${bet.amount_risked}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Odds</p>
                        <p className="font-medium">{bet.odds > 0 ? '+' : ''}{bet.odds}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Potential Payout</p>
                        <p className="font-medium">${bet.payout || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Profit/Loss</p>
                        <p className={`font-medium ${
                          bet.result === 'win' ? 'text-success' : 
                          bet.result === 'loss' ? 'text-error' : 'text-muted'
                        }`}>
                          {bet.result === 'win' ? `+$${(bet.payout - bet.amount_risked).toFixed(2)}` :
                           bet.result === 'loss' ? `-$${bet.amount_risked}` :
                           bet.result === 'push' ? '$0.00' : 'Pending'}
                        </p>
                      </div>
                    </div>
                    
                    {(!bet.result || bet.result === '') && (
                      <button
                        onClick={() => handleUpdateBet(bet)}
                        className="btn btn-primary text-sm"
                      >
                        Update Result
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Bet Modal */}
      {selectedBet && (
        <UpdateBetModal
          isOpen={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedBet(null);
          }}
          bet={selectedBet}
          onUpdate={handleBetUpdated}
        />
      )}
    </div>
  );
};

export default Bets;