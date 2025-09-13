import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, AlertCircle, CheckCircle } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const { API_URL } = await import('../config/api');
        const apiUrl = API_URL;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout
        
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      } catch (error) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('API health check failed:', error instanceof Error ? error.message : 'Unknown error');
        }
        setApiStatus('disconnected');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 60000); // Check every 60 seconds to reduce load

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (apiStatus === 'connected') return 'bg-green-500';
    if (apiStatus === 'disconnected') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (apiStatus === 'connected') return 'Connected';
    if (apiStatus === 'disconnected') return 'Mock Data';
    return 'Checking...';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (apiStatus === 'connected') return <CheckCircle className="h-4 w-4" />;
    if (apiStatus === 'disconnected') return <Database className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full text-white text-sm cursor-pointer transition-all duration-200 ${getStatusColor()} ${showDetails ? 'rounded-lg' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      {showDetails && (
        <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg border p-4 w-80 text-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Connection Status</span>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                <span>Internet: {isOnline ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Database className={`h-4 w-4 ${apiStatus === 'connected' ? 'text-green-500' : 'text-yellow-500'}`} />
                <span>Backend API: {apiStatus === 'connected' ? 'Connected' : 'Using Mock Data'}</span>
              </div>
            </div>

            {apiStatus === 'disconnected' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-800">
                    <p className="font-medium mb-1">Running in Development Mode</p>
                    <p className="text-xs">
                      The app is using mock data. All features work normally for testing and development.
                      See <code>BACKEND_SETUP.md</code> to connect to a real database.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {apiStatus === 'connected' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-green-800">
                    <p className="font-medium mb-1">Backend Connected</p>
                    <p className="text-xs">
                      All features are fully functional with real-time data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;