import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BankrollDataPoint {
  date: string;
  bankroll: number;
  profit: number;
}

interface BankrollChartProps {
  data: BankrollDataPoint[];
  height?: number;
}

const BankrollChart: React.FC<BankrollChartProps> = ({ data, height = 300 }) => {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-secondary border border-color p-3 rounded-lg shadow-lg">
          <p className="text-sm text-secondary mb-2">{formatDate(label)}</p>
          <p className="text-sm font-medium text-primary">
            Bankroll: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm font-medium" style={{color: payload[1].value >= 0 ? 'var(--success-color)' : 'var(--error-color)'}}>
            P&L: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-secondary mb-2">No bankroll data available</p>
          <p className="text-xs text-muted">
            Start placing bets to see your bankroll progression
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="var(--text-secondary)"
            fontSize={12}
            axisLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            stroke="var(--text-secondary)"
            fontSize={12}
            axisLine={{ stroke: 'var(--border-color)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="bankroll"
            stroke="var(--primary-color)"
            strokeWidth={3}
            dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'var(--primary-color)', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="var(--success-color)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: 'var(--success-color)', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BankrollChart;