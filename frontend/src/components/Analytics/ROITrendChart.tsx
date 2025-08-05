import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ROIDataPoint {
  period: string;
  roi: number;
  cumulativeROI: number;
  betsCount: number;
  profit: number;
  wagered: number;
}

interface ROITrendChartProps {
  data: ROIDataPoint[];
  height?: number;
  showCumulative?: boolean;
}

const ROITrendChart: React.FC<ROITrendChartProps> = ({ 
  data, 
  height = 300,
  showCumulative = true 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-secondary border border-color p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-primary mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p>Bets: {data.betsCount}</p>
            <p>Wagered: ${data.wagered.toFixed(2)}</p>
            <p style={{color: data.profit >= 0 ? 'var(--success-color)' : 'var(--error-color)'}}>
              Profit: ${data.profit.toFixed(2)}
            </p>
            <p style={{color: data.roi >= 0 ? 'var(--success-color)' : 'var(--error-color)'}}>
              Period ROI: {data.roi.toFixed(1)}%
            </p>
            {showCumulative && (
              <p style={{color: data.cumulativeROI >= 0 ? 'var(--success-color)' : 'var(--error-color)'}}>
                Cumulative ROI: {data.cumulativeROI.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-secondary mb-2">No ROI data available</p>
          <p className="text-xs text-muted">
            Complete some bets to see ROI trends
          </p>
        </div>
      </div>
    );
  }

  const minROI = Math.min(...data.map(d => Math.min(d.roi, showCumulative ? d.cumulativeROI : d.roi)));
  const maxROI = Math.max(...data.map(d => Math.max(d.roi, showCumulative ? d.cumulativeROI : d.roi)));
  const yAxisDomain = [
    Math.min(minROI - 5, -10),
    Math.max(maxROI + 5, 10)
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">ROI Trends</h3>
        <p className="text-sm text-secondary">Track your return on investment over time</p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="period" 
            stroke="var(--text-secondary)"
            fontSize={12}
            axisLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis 
            domain={yAxisDomain}
            tickFormatter={(value) => `${value}%`}
            stroke="var(--text-secondary)"
            fontSize={12}
            axisLine={{ stroke: 'var(--border-color)' }}
          />
          <ReferenceLine y={0} stroke="var(--text-muted)" strokeDasharray="2 2" />
          <Tooltip content={<CustomTooltip />} />
          
          <Line
            type="monotone"
            dataKey="roi"
            stroke="var(--primary-color)"
            strokeWidth={2}
            dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'var(--primary-color)', strokeWidth: 2 }}
            name="Period ROI"
          />
          
          {showCumulative && (
            <Line
              type="monotone"
              dataKey="cumulativeROI"
              stroke="var(--success-color)"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: 'var(--success-color)', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              name="Cumulative ROI"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center mt-4 gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-primary-color"></div>
          <span className="text-secondary">Period ROI</span>
        </div>
        {showCumulative && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-success-color" style={{backgroundImage: 'repeating-linear-gradient(to right, var(--success-color) 0, var(--success-color) 3px, transparent 3px, transparent 6px)'}}></div>
            <span className="text-secondary">Cumulative ROI</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ROITrendChart;