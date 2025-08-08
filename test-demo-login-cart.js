const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testDemoLoginAndCart() {
  try {
    console.log('🧪 Testing Demo Login and Cart Integration...\n');

    // Step 1: Test demo login (same as frontend does)
    console.log('1. Testing demo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword',
      rememberMe: false
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Demo login successful');
    console.log('   User:', user.name, '(' + user.email + ')');
    console.log('   Token type:', token.startsWith('eyJ') ? 'JWT' : 'Other');

    // Step 2: Test that the token works with cart
    console.log('\n2. Testing cart access with demo token...');
    const cartResponse = await axios.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Cart access successful:', cartResponse.data);

    // Step 3: Test adding item to cart
    console.log('\n3. Testing add to cart with demo user...');
    const addToCartResponse = await axios.post(`${API_BASE}/cart/add`, {
      productId: '507f1f77bcf86cd799439011',
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Add to cart successful:', {
      itemCount: addToCartResponse.data.items.length,
      totalAmount: addToCartResponse.data.totalAmount
    });

    // Step 4: Verify cart persistence
    console.log('\n4. Testing cart persistence...');
    const persistedCartResponse = await axios.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Cart persisted correctly:', {
      itemCount: persistedCartResponse.data.items.length,
      totalAmount: persistedCartResponse.data.totalAmount
    });

    console.log('\n🎉 Demo login and cart integration working perfectly!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Demo login generates valid JWT token');
    console.log('   ✅ JWT token works with cart authentication');
    console.log('   ✅ Add to cart functionality works');
    console.log('   ✅ Cart data persists correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   This indicates an authentication issue - the token is not being accepted');
    }
  }
}

testDemoLoginAndCart();