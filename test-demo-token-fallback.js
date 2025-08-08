const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testDemoTokenFallback() {
  try {
    console.log('🧪 Testing Demo Token Fallback...\n');

    // Test with old-style demo token (in case frontend still generates these)
    console.log('1. Testing cart access with old-style demo token...');
    const demoToken = 'demo_token_' + Date.now();
    
    const cartResponse = await axios.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    console.log('✅ Cart access with demo token successful:', cartResponse.data);

    // Test adding item to cart with demo token
    console.log('\n2. Testing add to cart with demo token...');
    const addToCartResponse = await axios.post(`${API_BASE}/cart/add`, {
      productId: '507f1f77bcf86cd799439012',
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    console.log('✅ Add to cart with demo token successful:', {
      itemCount: addToCartResponse.data.items.length,
      totalAmount: addToCartResponse.data.totalAmount
    });

    console.log('\n🎉 Demo token fallback working correctly!');

  } catch (error) {
    console.error('❌ Demo token fallback test failed:', error.response?.data || error.message);
  }
}

testDemoTokenFallback();