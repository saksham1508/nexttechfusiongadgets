import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const AuthStateDebugger: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">🔍 Auth State Debug</h4>
      <div className="space-y-1">
        <div>
          <strong>Redux User:</strong> {user ? `${user.name} (${user.email})` : 'null'}
        </div>
        <div>
          <strong>LocalStorage User:</strong> {storedUser ? 'Present' : 'null'}
        </div>
        <div>
          <strong>LocalStorage Token:</strong> {storedToken ? 'Present' : 'null'}
        </div>
        <div>
          <strong>Is Authenticated:</strong> {user || (storedUser && storedToken) ? '✅ Yes' : '❌ No'}
        </div>
      </div>
    </div>
  );
};

export default AuthStateDebugger;