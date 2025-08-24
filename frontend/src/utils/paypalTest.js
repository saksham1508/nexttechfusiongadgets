// PayPal Integration Test
console.log('🧪 PayPal Integration Test');

// Test 1: Check PayPal Client ID
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
console.log('💳 PayPal Client ID:', paypalClientId ? 'Configured ✅' : 'Not configured ❌');

// Test 2: Check PayPal SDK Loading
const testPayPalSDK = () => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
    script.onload = () => {
      console.log('💳 PayPal SDK loaded successfully ✅');
      if (window.paypal) {
        console.log('💳 PayPal object available ✅');
      } else {
        console.log('💳 PayPal object not available ❌');
      }
    };
    script.onerror = () => {
      console.log('💳 PayPal SDK failed to load ❌');
    };
    document.head.appendChild(script);
  }
};

// Test 3: Validate PayPal Configuration
const validatePayPalConfig = () => {
  const config = {
    clientId: paypalClientId,
    currency: 'USD',
    intent: 'capture'
  };
  
  console.log('💳 PayPal Configuration:', config);
  
  if (!config.clientId) {
    console.error('❌ PayPal Client ID is missing');
    return false;
  }
  
  if (config.clientId.length < 50) {
    console.warn('⚠️ PayPal Client ID seems too short - might be invalid');
  }
  
  console.log('✅ PayPal configuration looks valid');
  return true;
};

// Run tests
if (paypalClientId) {
  validatePayPalConfig();
  testPayPalSDK();
} else {
  console.error('❌ Cannot run PayPal tests - Client ID not configured');
}

export { validatePayPalConfig, testPayPalSDK };