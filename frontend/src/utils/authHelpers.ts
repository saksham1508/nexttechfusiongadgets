/**
 * Authentication helper utilities
 */

export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  authProvider?: string;
}

export interface AuthCheckResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  error?: string;
}

/**
 * Comprehensive authentication check
 * Validates both Redux state and localStorage data
 */
export const checkAuthentication = (reduxUser?: AuthUser | null): AuthCheckResult => {
  try {
    // Get data from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('🔍 Raw Auth Data:', {
      storedUser: storedUser ? storedUser.substring(0, 100) + '...' : null,
      storedToken: storedToken ? storedToken.substring(0, 20) + '...' : null,
      reduxUser: reduxUser
    });
    
    // Parse stored user data safely
    let parsedUser: AuthUser | null = null;
    let extractedToken: string | null = storedToken;
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('📦 Parsed User Data:', userData);
        
        // Extract token from user data if it exists there
        if (userData.token && !extractedToken) {
          extractedToken = userData.token;
          console.log('🔑 Token found in user data:', extractedToken ? extractedToken.substring(0, 20) + '...' : 'null');
        }
        
        // Handle multiple possible structures
        if (userData.user) {
          parsedUser = userData.user;
        } else if (userData._id || userData.id) {
          parsedUser = userData;
        } else if (userData.data && userData.data.user) {
          parsedUser = userData.data.user;
        } else if (userData.data && (userData.data._id || userData.data.id)) {
          parsedUser = userData.data;
        }
        
        console.log('👤 Final Parsed User:', parsedUser);
        console.log('🔑 Final Extracted Token:', extractedToken ? extractedToken.substring(0, 20) + '...' : null);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Don't clear data immediately, let's see what's wrong first
        return {
          isAuthenticated: false,
          user: null,
          token: null,
          error: 'Invalid stored user data'
        };
      }
    }
    
    // Check Redux user first, then localStorage user
    const user = reduxUser || parsedUser;
    const token = extractedToken;
    
    // More flexible authentication check
    const hasUser = !!(user && (user._id || (user as any).id));
    const hasToken = !!token;
    const isAuthenticated = hasUser && hasToken;
    
    console.log('🔍 Detailed Auth Check Result:', {
      reduxUser: !!reduxUser,
      reduxUserId: reduxUser?._id,
      reduxUserName: reduxUser?.name,
      storedUser: !!storedUser,
      parsedUser: !!parsedUser,
      parsedUserId: parsedUser?._id,
      parsedUserName: parsedUser?.name,
      storedToken: !!storedToken,
      finalUser: !!user,
      finalUserId: user?._id || (user as any)?.id,
      finalUserName: user?.name,
      hasUser,
      hasToken,
      isAuthenticated
    });
    
    return {
      isAuthenticated,
      user,
      token,
    };
  } catch (error) {
    console.error('Error in authentication check:', error);
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      error: 'Authentication check failed'
    };
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('persist:root');
  localStorage.removeItem('persist:auth');
  console.log('🧹 Authentication data cleared');
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: AuthUser | null, role: string): boolean => {
  return user?.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: AuthUser | null): boolean => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is customer
 */
export const isCustomer = (user: AuthUser | null): boolean => {
  return hasRole(user, 'customer');
};