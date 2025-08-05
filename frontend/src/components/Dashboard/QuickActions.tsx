import React from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

interface QuickActionsProps {
  onAddBet: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAddBet }) => {
  const actions: QuickAction[] = [
    {
      id: 'add-bet',
      label: 'Add Bet',
      icon: '➕',
      onClick: onAddBet,
      color: 'primary'
    },
    {
      id: 'view-analytics',
      label: 'Analytics',
      icon: '📊',
      onClick: () => {
        // Navigate to analytics page
        window.location.href = '/analytics';
      },
      color: 'secondary'
    },
    {
      id: 'export-data',
      label: 'Export',
      icon: '📤',
      onClick: () => {
        // TODO: Implement export functionality
        alert('Export functionality coming soon!');
      },
      color: 'success'
    },
    {
      id: 'set-goals',
      label: 'Set Goals',
      icon: '🎯',
      onClick: () => {
        // Navigate to profile/goals
        window.location.href = '/profile';
      },
      color: 'warning'
    }
  ];

  const getButtonClass = (color: string = 'primary') => {
    const baseClass = 'btn';
    switch (color) {
      case 'secondary':
        return `${baseClass} btn-secondary`;
      case 'success':
        return `${baseClass} btn-secondary`; // Using secondary for now
      case 'warning':
        return `${baseClass} btn-secondary`; // Using secondary for now
      default:
        return `${baseClass} btn-primary`;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`${getButtonClass(action.color)} flex-col gap-2 p-4 text-center`}
              aria-label={action.label}
            >
              <span 
                className="text-xl" 
                role="img" 
                aria-hidden="true"
              >
                {action.icon}
              </span>
              <span className="text-xs font-medium">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;