const axios = require('axios');

// Test payment flow
async function testPaymentFlow() {
  const API_URL = 'http://localhost:5001/api';
  
  console.log('🧪 Testing Payment Flow...\n');
  
  try {
    // Test 1: Check if payment routes are accessible
    console.log('1. Testing payment methods endpoint...');
    try {
      const response = await axios.get(`${API_URL}/payment-methods`);
      console.log('✅ Payment methods endpoint accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Payment methods endpoint accessible (requires auth)');
      } else {
        console.log('❌ Payment methods endpoint error:', error.message);
      }
    }
    
    // Test 2: Check Razorpay order creation
    console.log('\n2. Testing Razorpay order creation...');
    try {
      const orderData = {
        amount: 1000,
        currency: 'INR',
        receipt: 'test_receipt_123'
      };
      
      const response = await axios.post(`${API_URL}/payment-methods/razorpay/create-order`, orderData);
      console.log('✅ Razorpay order creation endpoint accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Razorpay order creation endpoint accessible (requires auth)');
      } else {
        console.log('❌ Razorpay order creation error:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 3: Check UPI payment creation
    console.log('\n3. Testing UPI payment creation...');
    try {
      const upiData = {
        amount: 1000,
        currency: 'INR',
        upiId: 'test@paytm',
        transactionId: 'test_txn_123'
      };
      
      const response = await axios.post(`${API_URL}/payment-methods/upi/create`, upiData);
      console.log('✅ UPI payment creation endpoint accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ UPI payment creation endpoint accessible (requires auth)');
      } else {
        console.log('❌ UPI payment creation error:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 4: Check server health
    console.log('\n4. Testing server health...');
    try {
      const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
      console.log('✅ Server health check passed');
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
    }
    
    console.log('\n🎉 Payment flow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentFlow();