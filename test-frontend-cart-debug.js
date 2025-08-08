const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testFrontendCartFlow() {
  try {
    console.log('🧪 Testing Frontend Cart Flow...\n');

    // Step 1: Login to get token (simulating frontend login)
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const userData = loginResponse.data;
    console.log('✅ Login successful:', userData);

    // Simulate how frontend stores the data
    const token = userData.token;
    const user = userData.user || userData;
    
    console.log('📦 Stored token:', token);
    console.log('👤 Stored user:', user);

    // Step 2: Test adding item to cart with the same headers frontend would use
    console.log('\n2. Testing add to cart with frontend-style headers...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📤 Request headers:', headers);
    
    const cartData = {
      productId: 'test-product-123',
      quantity: 1
    };
    
    console.log('📤 Request data:', cartData);
    
    const addToCartResponse = await axios.post(`${API_BASE}/cart/add`, cartData, { headers });
    console.log('✅ Item added to cart:', addToCartResponse.data);

    console.log('\n🎉 Frontend cart flow test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', error.config?.data);
  }
}

testFrontendCartFlow();