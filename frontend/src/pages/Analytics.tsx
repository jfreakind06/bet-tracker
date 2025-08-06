import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BankrollChart from '../components/Charts/BankrollChart';
import PerformanceChart from '../components/Analytics/PerformanceChart';
import ROITrendChart from '../components/Analytics/ROITrendChart';
import StreakAnalysis from '../components/Analytics/StreakAnalysis';

interface Bet {
  id: number;
  date: string;
  description: string;
  amount_risked: number;
  odds: number;
  result: string;
  payout: number;
  betType?: string;
  sport?: string;
}

const Analytics: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'trends' | 'streaks'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://bet-tracker-production.up.railway.app/bets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBets(res.data as Bet[]);
      } catch (err) {
        console.error('Failed to fetch bets', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [token]);

  // Filter bets based on time filter
  const getFilteredBets = () => {
    if (timeFilter === 'all') return bets;
    
    const now = new Date();
    const daysBack = parseInt(timeFilter.replace('d', ''));
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    return bets.filter(bet => new Date(bet.date) >= cutoffDate);
  };

  const filteredBets = getFilteredBets();

  // Generate bankroll data
  const generateBankrollData = () => {
    if (filteredBets.length === 0) return [];
    
    const sortedBets = [...filteredBets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBankroll = 1000; // Starting bankroll
    
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
      
      bankrollData.push({
        date: bet.date,
        bankroll: runningBankroll,
        profit: runningBankroll - 1000
      });
    });
    
    return bankrollData;
  };

  // Generate performance data by sport
  const generateSportPerformance = () => {
    const sportStats: {[key: string]: {wins: number, losses: number, pushes: number, profit: number, wagered: number}} = {};
    
    filteredBets.forEach(bet => {
      const sport = bet.sport || 'Other';
      if (!sportStats[sport]) {
        sportStats[sport] = {wins: 0, losses: 0, pushes: 0, profit: 0, wagered: 0};
      }
      
      sportStats[sport].wagered += bet.amount_risked;
      
      if (bet.result === 'win') {
        sportStats[sport].wins++;
        sportStats[sport].profit += (bet.payout - bet.amount_risked);
      } else if (bet.result === 'loss') {
        sportStats[sport].losses++;
        sportStats[sport].profit -= bet.amount_risked;
      } else if (bet.result === 'push') {
        sportStats[sport].pushes++;
      }
    });
    
    return Object.entries(sportStats).map(([sport, stats]) => ({
      category: sport,
      wins: stats.wins,
      losses: stats.losses,
      pushes: stats.pushes,
      winRate: ((stats.wins / (stats.wins + stats.losses + stats.pushes)) * 100) || 0,
      roi: stats.wagered > 0 ? ((stats.profit / stats.wagered) * 100) : 0,
      totalBets: stats.wins + stats.losses + stats.pushes,
      profit: stats.profit
    }));
  };

  // Generate ROI trend data
  const generateROITrends = () => {
    if (filteredBets.length === 0) return [];
    
    const sortedBets = [...filteredBets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const trends: any[] = [];
    
    // Group by week/month depending on data size
    const groupBy = sortedBets.length > 30 ? 'month' : 'week';
    const groups: {[key: string]: Bet[]} = {};
    
    sortedBets.forEach(bet => {
      const date = new Date(bet.date);
      let key: string;
      
      if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(bet);
    });
    
    let cumulativeProfit = 0;
    let cumulativeWagered = 0;
    
    Object.entries(groups).forEach(([period, periodBets]) => {
      const wagered = periodBets.reduce((sum, bet) => sum + bet.amount_risked, 0);
      const profit = periodBets.reduce((sum, bet) => {
        if (bet.result === 'win') return sum + (bet.payout - bet.amount_risked);
        if (bet.result === 'loss') return sum - bet.amount_risked;
        return sum;
      }, 0);
      
      cumulativeProfit += profit;
      cumulativeWagered += wagered;
      
      trends.push({
        period: period,
        roi: wagered > 0 ? (profit / wagered) * 100 : 0,
        cumulativeROI: cumulativeWagered > 0 ? (cumulativeProfit / cumulativeWagered) * 100 : 0,
        betsCount: periodBets.length,
        profit,
        wagered
      });
    });
    
    return trends;
  };

  const renderTabButton = (tab: typeof activeTab, label: string, icon: string) => (
    <button
      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
        activeTab === tab
          ? 'bg-primary-color text-white shadow-sm'
          : 'text-secondary hover:text-primary hover:bg-tertiary'
      }`}
      onClick={() => setActiveTab(tab)}
    >
      {icon} {label}
    </button>
  );

  const renderTimeFilter = () => (
    <div className="flex gap-1 bg-secondary rounded-lg p-1 border border-border-color">
      {[
        { key: 'all', label: 'All Time' },
        { key: '7d', label: '7 Days' },
        { key: '30d', label: '30 Days' },
        { key: '90d', label: '90 Days' }
      ].map(filter => (
        <button
          key={filter.key}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            timeFilter === filter.key
              ? 'bg-primary-color text-white shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
          onClick={() => setTimeFilter(filter.key as typeof timeFilter)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-secondary">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const bankrollData = generateBankrollData();
  const sportPerformance = generateSportPerformance();
  const roiTrends = generateROITrends();

  return (
    <div className="container">
      <div className="fade-in">
        <header className="p-4">
          <h1 className="text-2xl font-bold text-center">Analytics Dashboard</h1>
          <p className="text-center text-secondary mt-2">
            Advanced insights into your betting performance
          </p>
        </header>

        {/* Controls */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-secondary rounded-lg p-1 border border-border-color">
              {renderTabButton('overview', 'Overview', '📊')}
              {renderTabButton('performance', 'Performance', '🎯')}
              {renderTabButton('trends', 'Trends', '📈')}
              {renderTabButton('streaks', 'Streaks', '🔥')}
            </div>

            {/* Time Filter */}
            {renderTimeFilter()}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-primary">{filteredBets.length}</p>
                      <p className="text-sm text-secondary">Total Bets</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-success">
                        {filteredBets.filter(b => b.result === 'win').length}
                      </p>
                      <p className="text-sm text-secondary">Wins</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-error">
                        {filteredBets.filter(b => b.result === 'loss').length}
                      </p>
                      <p className="text-sm text-secondary">Losses</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-warning">
                        {filteredBets.filter(b => !b.result || b.result === '').length}
                      </p>
                      <p className="text-sm text-secondary">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Bankroll Chart */}
                {bankrollData.length > 1 && (
                  <div className="card">
                    <div className="card-header">
                      <h2 className="text-lg font-semibold">Bankroll Progress</h2>
                    </div>
                    <div className="card-body">
                      <BankrollChart data={bankrollData} height={300} />
                    </div>
                  </div>
                )}

                {/* Performance Overview */}
                {sportPerformance.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <h2 className="text-lg font-semibold">Performance by Sport</h2>
                    </div>
                    <div className="card-body">
                      <PerformanceChart 
                        data={sportPerformance} 
                        type="bar" 
                        title="Wins vs Losses by Sport"
                        height={300}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                {sportPerformance.length > 0 ? (
                  <>
                    <div className="card">
                      <div className="card-body">
                        <PerformanceChart 
                          data={sportPerformance} 
                          type="bar" 
                          title="Performance Breakdown by Sport"
                          height={400}
                        />
                      </div>
                    </div>
                    
                    <div className="card">
                      <div className="card-header">
                        <h2 className="text-lg font-semibold">Performance Summary</h2>
                      </div>
                      <div className="card-body">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border-color">
                                <th className="text-left p-2">Sport</th>
                                <th className="text-center p-2">Bets</th>
                                <th className="text-center p-2">W-L-P</th>
                                <th className="text-center p-2">Win Rate</th>
                                <th className="text-center p-2">ROI</th>
                                <th className="text-right p-2">Profit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sportPerformance.map(sport => (
                                <tr key={sport.category} className="border-b border-border-color">
                                  <td className="p-2 font-medium">{sport.category}</td>
                                  <td className="text-center p-2">{sport.totalBets}</td>
                                  <td className="text-center p-2">
                                    {sport.wins}-{sport.losses}-{sport.pushes}
                                  </td>
                                  <td className="text-center p-2">{sport.winRate.toFixed(1)}%</td>
                                  <td className="text-center p-2" style={{
                                    color: sport.roi >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                                  }}>
                                    {sport.roi.toFixed(1)}%
                                  </td>
                                  <td className="text-right p-2" style={{
                                    color: sport.profit >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                                  }}>
                                    ${sport.profit.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="card">
                    <div className="card-body text-center py-8">
                      <p className="text-secondary">No performance data available for the selected time period</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                {roiTrends.length > 0 ? (
                  <div className="card">
                    <div className="card-body">
                      <ROITrendChart data={roiTrends} height={400} />
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body text-center py-8">
                      <p className="text-secondary">Not enough data to show trends</p>
                      <p className="text-xs text-muted mt-2">Complete more bets to see ROI trends</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'streaks' && (
              <StreakAnalysis bets={filteredBets} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;