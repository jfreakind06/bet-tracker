import React from 'react';

interface RoiData {
  roi: number;
  totalRisked: number;
  totalWon: number;
  count: number;
  timeframe: string;
}

interface Props {
  roi: RoiData | null;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  error?: string;
}

const RoiSummary: React.FC<Props> = ({ roi, timeframe, onTimeframeChange, error }) => {
  return (
    <section className="dashboard__roi">
      <h2>ROI Summary</h2>
      <label htmlFor="timeframe">Timeframe:</label>
      <select
        id="timeframe"
        className="dashboard__select"
        value={timeframe}
        onChange={(e) => onTimeframeChange(e.target.value)}
      >
        <option value="day">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>

      {error && <p className="dashboard__error">{error}</p>}

      {roi && (
        <div className="dashboard__roi-values">
          <p><strong>ROI:</strong> {roi.roi.toFixed(2)}%</p>
          <p><strong>Total Risked:</strong> ${roi.totalRisked.toFixed(2)}</p>
          <p><strong>Total Won:</strong> ${roi.totalWon.toFixed(2)}</p>
          <p><strong>Number of Bets:</strong> {roi.count}</p>
        </div>
      )}
    </section>
  );
};

export default RoiSummary;
