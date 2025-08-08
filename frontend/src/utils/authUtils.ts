/**
 * Authentication utility functions
 */

/**
 * Completely clear all authentication data from localStorage and sessionStorage
 */
export const clearAllAuthData = (): void => {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear specific auth keys
  const authKeys = [
    'user',
    'token',
    'userRole',
    'refreshToken',
    'authProvider',
    'persist:root',
    'persist:auth',
    'redux-persist'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Clear any keys that might contain auth data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('✅ All authentication data cleared');
};

/**
 * Check if user is authenticated by checking both Redux state and localStorage
 */
export const isAuthenticated = (): boolean => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (!storedUser || !storedToken) {
      return false;
    }
    
    const userData = JSON.parse(storedUser);
    return !!(userData && (userData.user || userData._id || userData.id));
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = (): any | null => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    
    const userData = JSON.parse(storedUser);
    return userData.user || userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Force logout with complete cleanup
 */
export const forceLogout = (): void => {
  console.log('🔄 Force logout initiated...');
  
  // Clear all auth data
  clearAllAuthData();
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('forceLogout'));
  
  // Reload page to ensure clean state
  setTimeout(() => {
    window.location.href = '/';
  }, 100);
};