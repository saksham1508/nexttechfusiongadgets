const axios = require('axios');

async function testPayPalIntegration() {
  console.log('🧪 Testing PayPal Integration...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthCheck = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running');
    
    // Test 2: Test PayPal order creation (requires authentication)
    console.log('\n2. Testing PayPal order creation...');
    
    // First, let's try to login with demo credentials
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'demo@example.com',
      password: 'Demo@123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Demo login successful');
    
    // Now test PayPal order creation
    const paypalOrderResponse = await axios.post(
      'http://localhost:5000/api/payment-methods/paypal/create-order',
      {
        amount: 10.00,
        currency: 'USD',
        items: [
          {
            name: 'Test Product',
            description: 'Test PayPal Integration',
            price: 10.00,
            quantity: 1
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (paypalOrderResponse.data.success) {
      console.log('✅ PayPal order created successfully!');
      console.log('📋 Order ID:', paypalOrderResponse.data.data.orderId);
      console.log('📋 Status:', paypalOrderResponse.data.data.status);
      console.log('📋 Approval URL:', paypalOrderResponse.data.data.links.find(link => link.rel === 'approve')?.href);
    } else {
      console.log('❌ PayPal order creation failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you are logged in to test PayPal integration');
    }
    
    if (error.response?.data?.message?.includes('PayPal is not configured')) {
      console.log('\n💡 PayPal configuration issue detected');
      console.log('   Check if PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set in backend/.env.development');
    }
  }
}

// Run the test
testPayPalIntegration();