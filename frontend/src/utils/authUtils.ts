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

/**
 * Debug authentication state - logs detailed auth information
 */
export const debugAuthState = (): void => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  let parsedUser = null;
  let userToken = null;
  
  try {
    if (storedUser) {
      parsedUser = JSON.parse(storedUser);
      userToken = parsedUser.token;
    }
  } catch (error) {
    console.error('Error parsing stored user:', error);
  }
  
  // Log in the exact format from the original issue
  console.log('Redux User ID:', parsedUser?.user?._id || parsedUser?._id || 'None');
  console.log('Redux User Name:', parsedUser?.user?.name || parsedUser?.name || 'None');
  console.log('Raw Token:', (storedToken || userToken) ? '✅ Present' : '❌ None');
  console.log('Raw User:', parsedUser ? '✅ Present' : '❌ None');
  console.log('Parsed User Structure:');
  if (parsedUser) {
    console.log('```');
    console.log(JSON.stringify(parsedUser, null, 2));
    console.log('```');
  } else {
    console.log('None');
  }
  console.log('Final Auth Result:', (parsedUser && (storedToken || userToken)) ? '✅ Authenticated' : '❌ Failed');
  console.log('Final User ID:', parsedUser?.user?._id || parsedUser?._id || 'None');
  console.log('Final User Name:', parsedUser?.user?.name || parsedUser?.name || 'None');
  console.log('Final Token:', (storedToken || userToken) ? '✅ Present' : '❌ None');
  console.log('Token Preview:', (storedToken || userToken) ? (storedToken || userToken).substring(0, 20) + '...' : 'None');
};

/**
 * Fix authentication token synchronization issues
 */
export const fixAuthTokenSync = (): boolean => {
  console.log('🔧 Attempting to fix auth token synchronization...');
  
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // If user data has token but localStorage doesn't have separate token
      if (userData.token && !storedToken) {
        localStorage.setItem('token', userData.token);
        console.log('✅ Token synchronized from user data to localStorage');
        return true;
      }
      
      // If localStorage has token but user data doesn't
      if (!userData.token && storedToken) {
        userData.token = storedToken;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Token synchronized from localStorage to user data');
        return true;
      }
    }
    
    console.log('ℹ️ No token synchronization needed');
    return false;
  } catch (error) {
    console.error('❌ Error fixing auth token sync:', error);
    return false;
  }
};