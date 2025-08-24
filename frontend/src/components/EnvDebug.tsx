import React from 'react';

const EnvDebug: React.FC = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Environment Variables Debug</h3>
      <div className="space-y-1 text-sm">
        <div>
          <strong>REACT_APP_RAZORPAY_KEY_ID:</strong> 
          <span className="ml-2 font-mono">
            {process.env.REACT_APP_RAZORPAY_KEY_ID || 'NOT SET'}
          </span>
        </div>
        <div>
          <strong>REACT_APP_API_URL:</strong> 
          <span className="ml-2 font-mono">
            {process.env.REACT_APP_API_URL || 'NOT SET'}
          </span>
        </div>
        <div>
          <strong>NODE_ENV:</strong> 
          <span className="ml-2 font-mono">
            {process.env.NODE_ENV || 'NOT SET'}
          </span>
        </div>
        <div>
          <strong>All REACT_APP_ vars:</strong>
          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
            {JSON.stringify(
              Object.keys(process.env)
                .filter(key => key.startsWith('REACT_APP_'))
                .reduce((obj, key) => {
                  obj[key] = process.env[key];
                  return obj;
                }, {} as any),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default EnvDebug;