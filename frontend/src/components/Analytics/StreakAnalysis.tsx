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

interface StreakData {
  currentStreak: {
    type: 'win' | 'loss' | 'none';
    count: number;
    startDate: string;
    endDate: string;
  };
  longestWinStreak: {
    count: number;
    startDate: string;
    endDate: string;
    profit: number;
  };
  longestLossStreak: {
    count: number;
    startDate: string;
    endDate: string;
    loss: number;
  };
  streakHistory: {
    type: 'win' | 'loss';
    count: number;
    startDate: string;
    endDate: string;
    netResult: number;
  }[];
}

interface StreakAnalysisProps {
  bets: Bet[];
}

const StreakAnalysis: React.FC<StreakAnalysisProps> = ({ bets }) => {
  const calculateStreaks = (): StreakData => {
    if (bets.length === 0) {
      return {
        currentStreak: { type: 'none', count: 0, startDate: '', endDate: '' },
        longestWinStreak: { count: 0, startDate: '', endDate: '', profit: 0 },
        longestLossStreak: { count: 0, startDate: '', endDate: '', loss: 0 },
        streakHistory: []
      };
    }

    // Sort bets by date (most recent first for current streak calculation)
    const sortedBets = [...bets]
      .filter(bet => bet.result && bet.result !== '' && bet.result !== 'push')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedBets.length === 0) {
      return {
        currentStreak: { type: 'none', count: 0, startDate: '', endDate: '' },
        longestWinStreak: { count: 0, startDate: '', endDate: '', profit: 0 },
        longestLossStreak: { count: 0, startDate: '', endDate: '', loss: 0 },
        streakHistory: []
      };
    }

    // Calculate current streak
    let currentStreak = {
      type: sortedBets[0].result as 'win' | 'loss',
      count: 1,
      startDate: sortedBets[0].date,
      endDate: sortedBets[0].date
    };

    for (let i = 1; i < sortedBets.length; i++) {
      if (sortedBets[i].result === currentStreak.type) {
        currentStreak.count++;
        currentStreak.startDate = sortedBets[i].date;
      } else {
        break;
      }
    }

    // Calculate all streaks for history (chronological order)
    const chronologicalBets = [...sortedBets].reverse();
    const streakHistory: StreakData['streakHistory'] = [];
    let longestWinStreak = { count: 0, startDate: '', endDate: '', profit: 0 };
    let longestLossStreak = { count: 0, startDate: '', endDate: '', loss: 0 };

    let currentStreakType: 'win' | 'loss' | null = null;
    let currentStreakCount = 0;
    let currentStreakStart = '';
    let currentStreakNet = 0;

    chronologicalBets.forEach((bet, index) => {
      const betResult = bet.result as 'win' | 'loss';
      
      if (currentStreakType === betResult) {
        // Continue current streak
        currentStreakCount++;
        currentStreakNet += betResult === 'win' 
          ? (bet.payout - bet.amount_risked) 
          : -bet.amount_risked;
      } else {
        // End previous streak and start new one
        if (currentStreakType && currentStreakCount > 0) {
          const streakEnd = chronologicalBets[index - 1].date;
          streakHistory.push({
            type: currentStreakType,
            count: currentStreakCount,
            startDate: currentStreakStart,
            endDate: streakEnd,
            netResult: currentStreakNet
          });

          // Check if this is a record streak
          if (currentStreakType === 'win' && currentStreakCount > longestWinStreak.count) {
            longestWinStreak = {
              count: currentStreakCount,
              startDate: currentStreakStart,
              endDate: streakEnd,
              profit: currentStreakNet
            };
          } else if (currentStreakType === 'loss' && currentStreakCount > longestLossStreak.count) {
            longestLossStreak = {
              count: currentStreakCount,
              startDate: currentStreakStart,
              endDate: streakEnd,
              loss: Math.abs(currentStreakNet)
            };
          }
        }

        // Start new streak
        currentStreakType = betResult;
        currentStreakCount = 1;
        currentStreakStart = bet.date;
        currentStreakNet = betResult === 'win' 
          ? (bet.payout - bet.amount_risked) 
          : -bet.amount_risked;
      }

      // Handle last bet
      if (index === chronologicalBets.length - 1) {
        streakHistory.push({
          type: currentStreakType!,
          count: currentStreakCount,
          startDate: currentStreakStart,
          endDate: bet.date,
          netResult: currentStreakNet
        });

        if (currentStreakType === 'win' && currentStreakCount > longestWinStreak.count) {
          longestWinStreak = {
            count: currentStreakCount,
            startDate: currentStreakStart,
            endDate: bet.date,
            profit: currentStreakNet
          };
        } else if (currentStreakType === 'loss' && currentStreakCount > longestLossStreak.count) {
          longestLossStreak = {
            count: currentStreakCount,
            startDate: currentStreakStart,
            endDate: bet.date,
            loss: Math.abs(currentStreakNet)
          };
        }
      }
    });

    return {
      currentStreak: {
        ...currentStreak,
        type: currentStreak.count > 0 ? currentStreak.type : 'none'
      },
      longestWinStreak,
      longestLossStreak,
      streakHistory: streakHistory.slice(-10) // Last 10 streaks
    };
  };

  const streakData = calculateStreaks();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStreakIcon = (type: 'win' | 'loss' | 'none') => {
    switch (type) {
      case 'win': return '🔥';
      case 'loss': return '❄️';
      default: return '➖';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Streak */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getStreakIcon(streakData.currentStreak.type)}
            Current Streak
          </h3>
        </div>
        <div className="card-body text-center">
          {streakData.currentStreak.count === 0 ? (
            <div>
              <p className="text-2xl font-bold text-muted mb-2">No Active Streak</p>
              <p className="text-sm text-secondary">Place some bets to start tracking streaks</p>
            </div>
          ) : (
            <div>
              <p className="text-3xl font-bold mb-2" style={{
                color: streakData.currentStreak.type === 'win' ? 'var(--success-color)' : 'var(--error-color)'
              }}>
                {streakData.currentStreak.count} {streakData.currentStreak.type}s
              </p>
              <p className="text-sm text-secondary">
                Since {formatDate(streakData.currentStreak.startDate)}
                {streakData.currentStreak.startDate !== streakData.currentStreak.endDate && 
                  ` - ${formatDate(streakData.currentStreak.endDate)}`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Record Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-success">🏆 Longest Win Streak</h3>
          </div>
          <div className="card-body text-center">
            {streakData.longestWinStreak.count === 0 ? (
              <p className="text-secondary">No win streaks yet</p>
            ) : (
              <div>
                <p className="text-2xl font-bold text-success mb-1">
                  {streakData.longestWinStreak.count} wins
                </p>
                <p className="text-sm text-success font-medium mb-2">
                  +${streakData.longestWinStreak.profit.toFixed(2)}
                </p>
                <p className="text-xs text-secondary">
                  {formatDate(streakData.longestWinStreak.startDate)} - {formatDate(streakData.longestWinStreak.endDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-error">💔 Longest Loss Streak</h3>
          </div>
          <div className="card-body text-center">
            {streakData.longestLossStreak.count === 0 ? (
              <p className="text-secondary">No loss streaks yet</p>
            ) : (
              <div>
                <p className="text-2xl font-bold text-error mb-1">
                  {streakData.longestLossStreak.count} losses
                </p>
                <p className="text-sm text-error font-medium mb-2">
                  -${streakData.longestLossStreak.loss.toFixed(2)}
                </p>
                <p className="text-xs text-secondary">
                  {formatDate(streakData.longestLossStreak.startDate)} - {formatDate(streakData.longestLossStreak.endDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Streak History */}
      {streakData.streakHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Recent Streak History</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {streakData.streakHistory.map((streak, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-tertiary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {getStreakIcon(streak.type)}
                    </span>
                    <div>
                      <p className="font-medium" style={{
                        color: streak.type === 'win' ? 'var(--success-color)' : 'var(--error-color)'
                      }}>
                        {streak.count} {streak.type}{streak.count > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-secondary">
                        {formatDate(streak.startDate)} - {formatDate(streak.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p 
                      className="font-medium text-sm"
                      style={{
                        color: streak.netResult >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                      }}
                    >
                      {streak.netResult >= 0 ? '+' : ''}${streak.netResult.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Streak Insights */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">💡 Streak Insights</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Psychological Tips:</h4>
              <ul className="space-y-1 text-secondary">
                <li>• Don't chase losses during cold streaks</li>
                <li>• Stick to your unit size regardless of streaks</li>
                <li>• Hot streaks don't predict future outcomes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Pattern Recognition:</h4>
              <ul className="space-y-1 text-secondary">
                <li>• Look for sport-specific streak patterns</li>
                <li>• Consider bet type during streaks</li>
                <li>• Track emotional state during streaks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakAnalysis;