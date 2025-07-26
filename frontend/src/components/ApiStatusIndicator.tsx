import React, { useState, useEffect } from 'react';
import apiService, { HealthCheckResponse } from '../services/apiService';

const ApiStatusIndicator: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<HealthCheckResponse>({
    isHealthy: null as any,
    message: 'Checking connection...',
    status: 'loading'
  });

  const checkApiHealth = async (): Promise<void> => {
    try {
      const health = await apiService.healthCheck();
      setApiStatus(health);
    } catch (error) {
      setApiStatus({
        isHealthy: false,
        message: '❌ Failed to check API status',
        status: 'error',
        suggestion: 'Please check your internet connection and try again.'
      });
    }
  };

  useEffect(() => {
    checkApiHealth();
    
    // Check API health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (): string => {
    switch (apiStatus.status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (): string => {
    switch (apiStatus.status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  if (apiStatus.isHealthy === true) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg shadow-md">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} mr-2 animate-pulse`}></div>
          <span className="text-sm font-medium">API Connected</span>
        </div>
      </div>
    );
  }

  if (apiStatus.isHealthy === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{getStatusIcon()}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              Connection Issue
            </h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            {apiStatus.message}
          </p>
          
          {apiStatus.suggestion && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Suggestion:</strong> {apiStatus.suggestion}
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={checkApiHealth}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Refresh Page
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Make sure the backend server is running on port 5000
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg shadow-md">
        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2 animate-pulse"></div>
        <span className="text-sm font-medium">Connecting...</span>
      </div>
    </div>
  );
};

export default ApiStatusIndicator;