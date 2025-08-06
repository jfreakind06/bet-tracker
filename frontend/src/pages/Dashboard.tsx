import React, { useEffect, useState } from 'react';
import '../pagesCss/Dashboard.css';
import RoiSummary from '../components/RoiSummary';
import BankrollChart from '../components/Charts/BankrollChart';
import StatsCard from '../components/Dashboard/StatsCard';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentActivity from '../components/Dashboard/RecentActivity';
import AddBetForm from '../components/Forms/AddBetForm';
import UpdateBetModal from '../components/Bets/UpdateBetModal';
import { getBets, addBet as addBetAPI, getROI } from '../services/api';

interface Bet {
  id: number;
  date: string;
  description: string;
  amount_risked: number;
  odds: number;
  result: string;
  payout: number;
}

interface RoiData {
  roi: number;
  totalRisked: number;
  totalWon: number;
  count: number;
  timeframe: string;
}

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

const Dashboard: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [roi, setRoi] = useState<RoiData | null>(null);
  const [timeframe, setTimeframe] = useState<string>('week');
  const [error, setError] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [addBetLoading, setAddBetLoading] = useState<boolean>(false);


  const fetchBets = async () => {
    try {
      setLoading(true);
      const data = await getBets();
      if (data.error) {
        console.error('Failed to fetch bets:', data.error);
        setError(data.error);
      } else {
        setBets(data as Bet[]);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch bets', err);
      setError('Failed to load bets. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const fetchROI = async () => {
    try {
      const data = await getROI(timeframe);
      if (data.error) {
        console.error('Failed to fetch ROI:', data.error);
        setError(data.error);
      } else {
        setRoi(data as RoiData);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch ROI', err);
      setError('Failed to fetch ROI.');
    }
  };

  const addBet = async (formData: BetFormData) => {
    try {
      setAddBetLoading(true);
      const betData = {
        date: formData.date,
        description: formData.description,
        amountRisked: parseFloat(formData.amountRisked),
        odds: parseFloat(formData.odds),
        result: formData.result,
        payout: formData.payout ? parseFloat(formData.payout) : 0,
        betType: formData.betType,
        sport: formData.sport,
        notes: formData.notes,
      };
      
      const newBet = await addBetAPI(betData);
      if (newBet.error) {
        setError(newBet.error);
      } else {
        // Refresh both bets and ROI data
        await fetchBets();
        await fetchROI();
        setModalOpen(false);
        setError('');
      }
    } catch (err) {
      console.error('Failed to add bet', err);
      setError('Failed to add bet. Please try again.');
    } finally {
      setAddBetLoading(false);
    }
  };

  const handleUpdateBet = (bet: Bet) => {
    setSelectedBet(bet);
    setUpdateModalOpen(true);
  };

  const handleBetUpdated = async () => {
    try {
      // Refresh all data to ensure everything is in sync
      await fetchBets();
      await fetchROI();
      setUpdateModalOpen(false);
      setSelectedBet(null);
      setError('');
    } catch (err) {
      console.error('Failed to refresh data after bet update', err);
      setError('Bet updated but failed to refresh data. Please refresh the page.');
    }
  };

  // Helper functions for dashboard calculations
  const generateBankrollData = () => {
    if (bets.length === 0) return [];
    
    // Sort bets by date
    const sortedBets = [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBankroll = 1000; // Starting bankroll - could be configurable
    const bankrollData = [{
      date: sortedBets[0]?.date || new Date().toISOString().split('T')[0],
      bankroll: runningBankroll,
      profit: 0
    }];
    
    sortedBets.forEach((bet) => {
      if (bet.result === 'win') {
        runningBankroll += (bet.payout - bet.amount_risked);
      } else if (bet.result === 'loss') {
        runningBankroll -= bet.amount_risked;
      }
      // Push doesn't change bankroll
      
      bankrollData.push({
        date: bet.date,
        bankroll: runningBankroll,
        profit: runningBankroll - 1000
      });
    });
    
    return bankrollData;
  };

  const calculateStats = () => {
    const totalBets = bets.length;
    const completedBets = bets.filter(bet => bet.result && bet.result !== '');
    const winningBets = bets.filter(bet => bet.result === 'win');
    const losingBets = bets.filter(bet => bet.result === 'loss');
    const openBets = bets.filter(bet => !bet.result || bet.result === '');
    
    const winRate = completedBets.length > 0 ? (winningBets.length / completedBets.length) * 100 : 0;
    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount_risked, 0);
    const totalWon = winningBets.reduce((sum, bet) => sum + bet.payout, 0);
    const totalLost = losingBets.reduce((sum, bet) => sum + bet.amount_risked, 0);
    const netProfit = totalWon - totalLost;
    const roiPercent = totalWagered > 0 ? ((netProfit / totalWagered) * 100) : 0;
    
    return {
      totalBets,
      completedBets: completedBets.length,
      openBets: openBets.length,
      winRate,
      totalWagered,
      netProfit,
      roiPercent,
      averageBetSize: totalBets > 0 ? totalWagered / totalBets : 0
    };
  };

  const filteredBets = bets.filter((bet) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return bet.result === '';
    return bet.result === activeTab;
  });

  const stats = calculateStats();
  const bankrollData = generateBankrollData();

  useEffect(() => {
    fetchBets();
  }, []);

  useEffect(() => {
    fetchROI();
  }, [timeframe]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    if (modalOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalOpen]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <div className="spinner"></div>
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with Welcome Message */}
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">
            Welcome Back{(() => {
              try {
                const user = localStorage.getItem('user');
                if (user) {
                  const userData = JSON.parse(user);
                  return userData.username ? `, ${userData.username}!` : '!';
                }
                return '!';
              } catch {
                return '!';
              }
            })()}
          </h1>
          <p className="text-secondary text-sm">
            Track your betting performance and grow your bankroll
          </p>
        </div>
        <button className="dashboard__add-btn" onClick={() => setModalOpen(true)}>
          + Add Bet
        </button>
      </header>

      {/* Key Stats Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Bets"
          value={stats.totalBets}
          subtitle="All time"
          icon="📊"
          color="primary"
        />
        <StatsCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subtitle={`${stats.completedBets} completed`}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
          trendValue={stats.winRate >= 50 ? 'Strong' : 'Needs work'}
          icon="🎯"
          color={stats.winRate >= 50 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Net Profit"
          value={`$${stats.netProfit.toFixed(2)}`}
          subtitle={`${stats.roiPercent.toFixed(1)}% ROI`}
          trend={stats.netProfit >= 0 ? 'up' : 'down'}
          trendValue={stats.netProfit >= 0 ? 'Profitable' : 'In the red'}
          icon="💰"
          color={stats.netProfit >= 0 ? 'success' : 'error'}
        />
        <StatsCard
          title="Open Bets"
          value={stats.openBets}
          subtitle="Pending results"
          icon="⏳"
          color="warning"
        />
      </section>

      {/* Quick Actions */}
      <QuickActions onAddBet={() => setModalOpen(true)} />

      {/* Bankroll Chart */}
      {bankrollData.length > 1 && (
        <section className="card mb-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Bankroll Progress</h2>
            <p className="text-sm text-secondary">Track your betting performance over time</p>
          </div>
          <div className="card-body">
            <BankrollChart data={bankrollData} height={250} />
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <RecentActivity bets={bets} limit={5} />

      {/* Bet Filters and List */}
      <section className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">All Bets</h2>
        </div>
        <div className="card-body p-0">
          <nav className="dashboard__tabs">
            {['all', 'win', 'loss', 'push', 'open'].map((tab) => (
              <button
                key={tab}
                className={`dashboard__tab ${activeTab === tab ? 'dashboard__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="p-4">
            <section className="dashboard__list">
              {filteredBets.length === 0 ? (
                <div className="dashboard__empty-state">
                  <h3>No bets found</h3>
                  <p>
                    {activeTab === 'all' 
                      ? "You haven't placed any bets yet. Click 'Add Bet' to get started!"
                      : `No ${activeTab} bets found. Try a different filter.`
                    }
                  </p>
                </div>
              ) : (
                filteredBets.map((bet) => (
                  <div key={bet.id} className={`dashboard__bet dashboard__bet--${bet.result || 'open'}`}>
                    <div className="dashboard__bet-main">
                      <span>{bet.date}</span>
                      <strong>{bet.description}</strong>
                      <span>${bet.amount_risked} @ {bet.odds}</span>
                      <span>{bet.result || 'Open'}</span>
                    </div>
                    <div className="dashboard__bet-actions">
                      <div className="dashboard__bet-payout">
                        {bet.result === 'win' && <>Won ${bet.payout.toFixed(2)}</>}
                        {bet.result === 'loss' && <>Lost ${bet.amount_risked.toFixed(2)}</>}
                        {bet.result === 'push' && <>Push</>}
                        {bet.result === '' && <>Potential: ${(Math.abs(bet.odds) >= 100 ? bet.odds > 0
                          ? bet.amount_risked + (bet.amount_risked * bet.odds) / 100
                          : bet.amount_risked + (bet.amount_risked * 100) / Math.abs(bet.odds)
                        : 0).toFixed(2)}</>}
                      </div>
                      {(!bet.result || bet.result === '') && (
                        <button
                          className="dashboard__update-btn"
                          onClick={() => handleUpdateBet(bet)}
                          aria-label={`Update result for ${bet.description}`}
                        >
                          ⚡ Update
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </section>

      {/* ROI Summary */}
      <RoiSummary
        roi={roi}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        error={error}
      />
      {modalOpen && (
        <div className="dashboard__modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="dashboard__modal-close" 
              onClick={() => setModalOpen(false)}
              aria-label="Close modal"
            >
              ✖
            </button>
            <AddBetForm
              onSubmit={addBet}
              onCancel={() => setModalOpen(false)}
              loading={addBetLoading}
            />
          </div>
        </div>
      )}

      {selectedBet && (
        <UpdateBetModal
          bet={selectedBet}
          isOpen={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedBet(null);
          }}
          onUpdate={handleBetUpdated}
        />
      )}
    </div>
  );
};

export default Dashboard;
