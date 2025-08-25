// Frontend Razorpay Debug Script
// Run this in browser console on http://localhost:3000/payment-test

console.log('🔍 Frontend Razorpay Debug Script');
console.log('=====================================');

// Test 1: Check environment variables
console.log('\n1. 🔧 Environment Variables Check...');
console.log('REACT_APP_RAZORPAY_KEY_ID:', process.env.REACT_APP_RAZORPAY_KEY_ID);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test 2: Check if Razorpay script is loaded
console.log('\n2. 📜 Razorpay Script Check...');
console.log('window.Razorpay:', typeof window.Razorpay);
console.log('Razorpay available:', !!window.Razorpay);

// Test 3: Test backend API directly
console.log('\n3. 🌐 Backend API Test...');
async function testBackendAPI() {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/payment-methods/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'INR',
        receipt: 'debug_test'
      })
    });
    
    const data = await response.json();
    console.log('✅ Backend API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Backend API Error:', error);
    return null;
  }
}

// Test 4: Test Razorpay initialization
console.log('\n4. 🚀 Razorpay Initialization Test...');
async function testRazorpayInit() {
  try {
    const orderData = await testBackendAPI();
    if (!orderData || !orderData.success) {
      throw new Error('Backend API failed');
    }

    const order = orderData.data;
    const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!razorpayKeyId) {
      throw new Error('Razorpay key not found in environment');
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay script not loaded');
    }

    const options = {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Debug Test',
      description: 'Debug test payment',
      order_id: order.orderId,
      handler: function(response) {
        console.log('✅ Payment Success Handler Called:', response);
      },
      modal: {
        ondismiss: function() {
          console.log('❌ Payment Cancelled');
        }
      }
    };

    console.log('Razorpay Options:', options);

    const razorpay = new window.Razorpay(options);
    console.log('✅ Razorpay instance created successfully');
    
    // Don't actually open it, just test creation
    console.log('✅ Razorpay initialization test passed');
    
    return true;
  } catch (error) {
    console.error('❌ Razorpay initialization failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🧪 Running all tests...');
  
  const backendResult = await testBackendAPI();
  const razorpayResult = await testRazorpayInit();
  
  console.log('\n📊 Test Results:');
  console.log('Backend API:', backendResult ? '✅ PASS' : '❌ FAIL');
  console.log('Razorpay Init:', razorpayResult ? '✅ PASS' : '❌ FAIL');
  
  if (backendResult && razorpayResult) {
    console.log('\n🎉 All tests passed! Razorpay should work.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Auto-run tests
runAllTests();

// Export functions for manual testing
window.debugRazorpay = {
  testBackendAPI,
  testRazorpayInit,
  runAllTests
};