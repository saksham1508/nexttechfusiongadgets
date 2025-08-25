import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const QuickLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleQuickLogin = () => {
    const testUser = {
      _id: 'test_user_123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer'
    };

    const testToken = 'test_token_123';

    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('token', testToken);

    // Update Redux state (you'll need to dispatch the login action)
    // For now, just reload the page to trigger auth check
    window.location.reload();
    
    toast.success('Logged in as Test User!');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload();
    toast.success('Logged out successfully!');
  };

  if (user) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-green-100 border border-green-400 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Logged in as: {user.name}
            </p>
            <p className="text-xs text-green-600">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-green-600 hover:text-green-800"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleQuickLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-colors"
      >
        <User className="w-4 h-4" />
        <span>Quick Login (Test)</span>
      </button>
    </div>
  );
};

export default QuickLogin;