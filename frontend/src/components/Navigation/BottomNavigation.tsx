import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNavigation.css';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: number;
}

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: '🏠',
      label: 'Home',
    },
    {
      path: '/bets',
      icon: '📊',
      label: 'Bets',
    },
    {
      path: '/analytics',
      icon: '📈',
      label: 'Analytics',
    },
    {
      path: '/profile',
      icon: '👤',
      label: 'Profile',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="bottom-nav__container">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`bottom-nav__item ${isActive(item.path) ? 'bottom-nav__item--active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            aria-label={`Navigate to ${item.label}`}
            type="button"
          >
            <div className="bottom-nav__icon-container">
              <span className="bottom-nav__icon" role="img" aria-hidden="true">
                {item.icon}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="bottom-nav__badge" aria-label={`${item.badge} notifications`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;