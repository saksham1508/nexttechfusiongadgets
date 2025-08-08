const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testCartFlow() {
  try {
    console.log('🧪 Testing Cart Functionality...\n');

    // Step 1: Login to get token
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Step 2: Test adding item to cart
    console.log('\n2. Testing add to cart...');
    const addToCartResponse = await axios.post(`${API_BASE}/cart/add`, {
      productId: 'test-product-123',
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Item added to cart:', addToCartResponse.data);

    console.log('\n🎉 All cart tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testCartFlow();