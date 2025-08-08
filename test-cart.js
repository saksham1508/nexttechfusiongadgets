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

    // Step 2: Test getting empty cart
    console.log('\n2. Testing get cart (should be empty)...');
    const emptyCartResponse = await axios.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Empty cart retrieved:', emptyCartResponse.data);

    // Step 3: Test adding item to cart
    console.log('\n3. Testing add to cart...');
    const addToCartResponse = await axios.post(`${API_BASE}/cart/add`, {
      productId: '507f1f77bcf86cd799439011',
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Item added to cart:', addToCartResponse.data);

    // Step 4: Test getting cart with items
    console.log('\n4. Testing get cart (should have items)...');
    const cartWithItemsResponse = await axios.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Cart with items:', cartWithItemsResponse.data);

    // Step 5: Test updating cart item
    console.log('\n5. Testing update cart item...');
    const updateCartResponse = await axios.put(`${API_BASE}/cart/update`, {
      productId: '507f1f77bcf86cd799439011',
      quantity: 3
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Cart item updated:', updateCartResponse.data);

    // Step 6: Test cart without authentication (should fail)
    console.log('\n6. Testing cart without authentication (should fail)...');
    try {
      await axios.get(`${API_BASE}/cart`);
      console.log('❌ This should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected unauthorized request:', error.response.status, error.response.data.message);
    }

    console.log('\n🎉 All cart tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCartFlow();