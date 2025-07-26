import React from 'react';

interface EnvironmentBadgeProps {
  className?: string;
}

const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ className = '' }) => {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
  const envName = process.env.REACT_APP_ENV_NAME || env;
  const envColor = process.env.REACT_APP_ENV_COLOR;
  const showBadge = process.env.REACT_APP_ENV_BADGE === 'true';

  // Don't show badge in production unless explicitly enabled
  if (!showBadge && env === 'production') {
    return null;
  }

  const getEnvironmentStyles = () => {
    switch (env) {
      case 'development':
        return {
          backgroundColor: envColor || '#10B981',
          color: 'white',
          borderColor: envColor || '#10B981',
        };
      case 'test':
        return {
          backgroundColor: envColor || '#F59E0B',
          color: 'white',
          borderColor: envColor || '#F59E0B',
        };
      case 'production':
        return {
          backgroundColor: envColor || '#EF4444',
          color: 'white',
          borderColor: envColor || '#EF4444',
        };
      default:
        return {
          backgroundColor: '#6B7280',
          color: 'white',
          borderColor: '#6B7280',
        };
    }
  };

  const styles = getEnvironmentStyles();

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg border-2 ${className}`}
      style={styles}
      title={`Environment: ${envName}`}
    >
      {envName}
    </div>
  );
};

export default EnvironmentBadge;