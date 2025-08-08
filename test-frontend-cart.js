const axios = require('axios');

// Simulate frontend request
const testFrontendCartFlow = async () => {
  try {
    console.log('🧪 Testing Frontend Cart Flow...\n');

    // Step 1: Login (simulate frontend login)
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log('✅ Login successful');
    console.log('Response structure:', Object.keys(loginResponse.data));
    console.log('Has token:', !!loginResponse.data.token);
    
    const token = loginResponse.data.token;

    // Step 2: Test add to cart (simulate frontend request)
    console.log('\n2. Testing add to cart...');
    const addToCartResponse = await axios.post('http://localhost:5001/api/cart/add', {
      productId: '507f1f77bcf86cd799439011',
      quantity: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log('✅ Add to cart successful');
    console.log('Cart items:', addToCartResponse.data.items?.length || 0);
    console.log('Total amount:', addToCartResponse.data.totalAmount);

    // Step 3: Test get cart
    console.log('\n3. Testing get cart...');
    const getCartResponse = await axios.get('http://localhost:5001/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log('✅ Get cart successful');
    console.log('Cart items:', getCartResponse.data.items?.length || 0);

    console.log('\n🎉 All tests passed! Cart functionality is working.');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error.message);
  }
};

testFrontendCartFlow();