import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'seller' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Check authentication more thoroughly
  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    // Allow if user exists in Redux state
    if (user && (user._id || user.id)) {
      return { isAuthenticated: true, user };
    }
    
    // Allow if user data exists in localStorage
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const effectiveUser = parsedUser.user || parsedUser;
        if (effectiveUser && (effectiveUser._id || effectiveUser.id)) {
          return { isAuthenticated: true, user: effectiveUser };
        }
      } catch (error) {
        console.error('Error parsing stored user in ProtectedRoute:', error);
      }
    }
    
    // Allow if token exists (user might be authenticated but Redux not hydrated yet)
    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      return { isAuthenticated: true, user: null }; // Token exists, assume authenticated
    }
    
    return { isAuthenticated: false, user: null };
  };

  const authResult = checkAuth();
  
  if (!authResult.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const effectiveUser = authResult.user;

  if (requiredRole && effectiveUser && effectiveUser.role !== requiredRole) {
    // Special case: Allow non-sellers to access vendor dashboard for onboarding
    if (requiredRole === 'seller' && location.pathname === '/vendor/dashboard') {
      // Let them through - the dashboard will handle showing onboarding vs actual dashboard
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
