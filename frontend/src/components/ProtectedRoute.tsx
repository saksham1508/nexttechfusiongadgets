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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
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
