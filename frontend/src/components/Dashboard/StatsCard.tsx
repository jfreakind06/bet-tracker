import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'neutral'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'border-primary-color bg-blue-50';
      case 'success':
        return 'border-success-color bg-green-50';
      case 'warning':
        return 'border-warning-color bg-yellow-50';
      case 'error':
        return 'border-error-color bg-red-50';
      default:
        return 'border-border-color';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➖';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'var(--success-color)';
      case 'down':
        return 'var(--error-color)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div className={`card ${getColorClasses()}`}>
      <div className="card-body">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-secondary mb-1">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {value}
              </span>
              {icon && (
                <span className="text-lg" role="img" aria-hidden="true">
                  {icon}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {(subtitle || (trend && trendValue)) && (
          <div className="flex items-center justify-between mt-3">
            {subtitle && (
              <p className="text-xs text-muted">
                {subtitle}
              </p>
            )}
            {trend && trendValue && (
              <div 
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: getTrendColor() }}
              >
                <span role="img" aria-hidden="true">
                  {getTrendIcon()}
                </span>
                {trendValue}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;