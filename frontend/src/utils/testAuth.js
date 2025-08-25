// Test authentication flow
// Run this in browser console to test authentication

const testAuth = () => {
  console.log('🧪 Testing Authentication...');
  
  // Check current localStorage state
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  console.log('📦 Raw localStorage data:');
  console.log('User:', storedUser);
  console.log('Token:', storedToken);
  
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      console.log('📦 Parsed user data:', parsed);
      console.log('📦 User structure keys:', Object.keys(parsed));
      
      if (parsed.user) {
        console.log('📦 Nested user keys:', Object.keys(parsed.user));
        console.log('📦 Nested user ID:', parsed.user._id || parsed.user.id);
      } else {
        console.log('📦 Direct user ID:', parsed._id || parsed.id);
      }
    } catch (error) {
      console.error('❌ Failed to parse user data:', error);
    }
  }
  
  // Test login with demo credentials
  const testLogin = async () => {
    try {
      console.log('🔐 Testing login...');
      
      // Create test user data
      const testUserData = {
        user: {
          _id: 'test_user_123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer'
        },
        token: 'test_token_123'
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(testUserData));
      localStorage.setItem('token', testUserData.token);
      
      console.log('✅ Test user data stored');
      console.log('📦 Stored data:', testUserData);
      
      // Trigger Redux sync
      if (window.store) {
        window.store.dispatch({ type: 'auth/syncFromLocalStorage' });
        console.log('🔄 Redux sync triggered');
      }
      
      return testUserData;
    } catch (error) {
      console.error('❌ Test login failed:', error);
    }
  };
  
  return {
    storedUser: !!storedUser,
    storedToken: !!storedToken,
    testLogin
  };
};

// Make available globally
window.testAuth = testAuth;

console.log('🧪 Auth test loaded. Run testAuth() in console.');