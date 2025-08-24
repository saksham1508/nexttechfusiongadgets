const axios = require('axios');

// Test payment flow with authentication
async function testPaymentFlowWithAuth() {
  const API_URL = 'http://localhost:5001/api';
  
  console.log('🧪 Testing Payment Flow with Authentication...\n');
  
  try {
    // Step 1: Try to register/login to get a token
    console.log('1. Attempting to get authentication token...');
    let authToken = null;
    
    try {
      // Try to register a test user
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      };
      
      const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
      authToken = registerResponse.data.token;
      console.log('✅ Successfully registered and got auth token');
    } catch (registerError) {
      // If registration fails, try to login
      try {
        const loginData = {
          email: 'test@example.com',
          password: 'testpassword123'
        };
        
        const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
        authToken = loginResponse.data.token;
        console.log('✅ Successfully logged in and got auth token');
      } catch (loginError) {
        console.log('❌ Could not get auth token:', loginError.response?.data?.message || loginError.message);
        console.log('⚠️  Continuing without authentication...');
      }
    }
    
    // Step 2: Test payment methods with auth token
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    
    console.log('\n2. Testing Razorpay order creation with auth...');
    try {
      const orderData = {
        amount: 1000,
        currency: 'INR',
        receipt: 'test_receipt_123'
      };
      
      const response = await axios.post(`${API_URL}/payment-methods/razorpay/create-order`, orderData, { headers });
      console.log('✅ Razorpay order created successfully:', response.data);
    } catch (error) {
      console.log('❌ Razorpay order creation failed:', error.response?.data?.message || error.message);
      console.log('Response status:', error.response?.status);
      console.log('Response data:', error.response?.data);
    }
    
    console.log('\n3. Testing UPI payment creation with auth...');
    try {
      const upiData = {
        amount: 1000,
        currency: 'INR',
        upiId: 'test@paytm',
        transactionId: 'test_txn_123'
      };
      
      const response = await axios.post(`${API_URL}/payment-methods/upi/create`, upiData, { headers });
      console.log('✅ UPI payment created successfully:', response.data);
    } catch (error) {
      console.log('❌ UPI payment creation failed:', error.response?.data?.message || error.message);
      console.log('Response status:', error.response?.status);
    }
    
    console.log('\n4. Testing Google Pay payment creation with auth...');
    try {
      const googlePayData = {
        amount: 1000,
        currency: 'INR',
        orderId: 'test_order_123'
      };
      
      const response = await axios.post(`${API_URL}/payment-methods/googlepay/create`, googlePayData, { headers });
      console.log('✅ Google Pay payment created successfully:', response.data);
    } catch (error) {
      console.log('❌ Google Pay payment creation failed:', error.response?.data?.message || error.message);
      console.log('Response status:', error.response?.status);
    }
    
    console.log('\n🎉 Payment flow test with authentication completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentFlowWithAuth();