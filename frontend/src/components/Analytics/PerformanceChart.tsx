import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface PerformanceData {
  category: string;
  wins: number;
  losses: number;
  pushes: number;
  winRate: number;
  roi: number;
  totalBets: number;
  profit: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  type: 'bar' | 'pie';
  title: string;
  height?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  type, 
  title, 
  height = 300 
}) => {
  const COLORS = [
    'var(--success-color)',
    'var(--error-color)', 
    'var(--warning-color)',
    'var(--primary-color)',
    'var(--info-color)'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-secondary border border-color p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-primary mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p>Total Bets: {data.totalBets}</p>
            <p style={{color: 'var(--success-color)'}}>Wins: {data.wins}</p>
            <p style={{color: 'var(--error-color)'}}>Losses: {data.losses}</p>
            {data.pushes > 0 && <p style={{color: 'var(--warning-color)'}}>Pushes: {data.pushes}</p>}
            <p>Win Rate: {data.winRate.toFixed(1)}%</p>
            <p style={{color: data.roi >= 0 ? 'var(--success-color)' : 'var(--error-color)'}}>
              ROI: {data.roi.toFixed(1)}%
            </p>
            <p style={{color: data.profit >= 0 ? 'var(--success-color)' : 'var(--error-color)'}}>
              Profit: ${data.profit.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-secondary border border-color p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-primary mb-1">{data.payload.category}</p>
          <p className="text-xs">
            {data.name}: {data.value} ({((data.value / data.payload.totalBets) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-secondary mb-2">No data available</p>
          <p className="text-xs text-muted">
            Place some bets to see performance analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="category" 
              stroke="var(--text-secondary)"
              fontSize={12}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              fontSize={12}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="wins" stackId="a" fill="var(--success-color)" />
            <Bar dataKey="losses" stackId="a" fill="var(--error-color)" />
            <Bar dataKey="pushes" stackId="a" fill="var(--warning-color)" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data.map(item => ({
                ...item,
                wins: item.wins,
                losses: item.losses,
                pushes: item.pushes
              })).flatMap(item => [
                { category: item.category, name: 'Wins', value: item.wins, totalBets: item.totalBets },
                { category: item.category, name: 'Losses', value: item.losses, totalBets: item.totalBets },
                ...(item.pushes > 0 ? [{ category: item.category, name: 'Pushes', value: item.pushes, totalBets: item.totalBets }] : [])
              ])}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.flatMap(item => [
                { name: 'Wins' },
                { name: 'Losses' },
                ...(item.pushes > 0 ? [{ name: 'Pushes' }] : [])
              ]).map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;