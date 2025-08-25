// Test script to verify checkout functionality
// Run this in browser console to test authentication and checkout flow

const testCheckoutFlow = () => {
  console.log('🧪 Testing Checkout Flow...');
  
  // Test 1: Check if user is authenticated
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  console.log('👤 User in localStorage:', storedUser ? 'Found' : 'Not found');
  console.log('🔑 Token in localStorage:', storedToken ? 'Found' : 'Not found');
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const effectiveUser = parsedUser.user || parsedUser;
      console.log('✅ User data is valid:', effectiveUser);
    } catch (error) {
      console.error('❌ User data is corrupted:', error);
    }
  }
  
  // Test 2: Check PayPal configuration
  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  console.log('💳 PayPal Client ID:', paypalClientId ? 'Configured' : 'Not configured');
  
  // Test 3: Check if cart has items
  const mockCart = localStorage.getItem('mockCart');
  console.log('🛒 Cart items:', mockCart ? JSON.parse(mockCart).length : 0);
  
  // Test 4: Simulate checkout navigation
  if (window.location.pathname !== '/checkout') {
    console.log('🔄 Navigate to /checkout to test the flow');
  } else {
    console.log('✅ Already on checkout page');
  }
  
  return {
    hasUser: !!storedUser,
    hasToken: !!storedToken,
    hasPayPal: !!paypalClientId,
    cartItems: mockCart ? JSON.parse(mockCart).length : 0
  };
};

// Export for use in console
window.testCheckoutFlow = testCheckoutFlow;

console.log('🧪 Test function loaded. Run testCheckoutFlow() in console to test.');