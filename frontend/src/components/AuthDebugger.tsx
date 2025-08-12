import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { logout, logoutSync } from '../store/slices/authSlice';
import { clearAllAuthData, forceLogout, debugAuthState, fixAuthTokenSync } from '../utils/authUtils';
import toast from 'react-hot-toast';

const AuthDebugger: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const handleClearAuth = () => {
    console.log('🔄 Debug logout clicked');
    
    // Use synchronous logout for immediate effect
    dispatch(logoutSync());
    
    // Also dispatch async logout as backup
    dispatch(logout());
    
    toast.success('Authentication data cleared');
    
    console.log('✅ Debug logout completed');
  };

  const handleClearLocalStorage = () => {
    clearAllAuthData();
    toast.success('All auth data cleared');
    window.location.reload();
  };

  const handleForceLogout = () => {
    forceLogout();
    toast.success('Force logout completed');
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2 text-gray-800">Auth Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Redux User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}
        </div>
        
        {user && (
          <div className="bg-gray-50 p-2 rounded">
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>Provider:</strong> {user.authProvider || 'email'}</div>
          </div>
        )}
        
        <div>
          <strong>LocalStorage User:</strong> {localStorage.getItem('user') ? '✅ Exists' : '❌ None'}
        </div>
        
        <div>
          <strong>LocalStorage Token:</strong> {localStorage.getItem('token') ? '✅ Exists' : '❌ None'}
        </div>
        
        <div>
          <strong>Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}
        </div>
        
        {error && (
          <div>
            <strong>Error:</strong> <span className="text-red-600">{error}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-2">
        <button
          onClick={handleClearAuth}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          Logout (Redux)
        </button>
        
        <button
          onClick={handleClearLocalStorage}
          className="w-full bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
        >
          Clear All Auth Data
        </button>
        
        <button
          onClick={handleForceLogout}
          className="w-full bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
        >
          Force Logout
        </button>
        
        <button
          onClick={() => debugAuthState()}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
        >
          Debug Auth State
        </button>
        
        <button
          onClick={() => {
            const fixed = fixAuthTokenSync();
            if (fixed) {
              toast.success('Token synchronization fixed');
              window.location.reload();
            } else {
              toast('No token sync issues found', { icon: 'ℹ️' });
            }
          }}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
        >
          Fix Token Sync
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;