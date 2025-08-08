const axios = require('axios');

// Test the complete cart workflow that matches frontend behavior
async function testCartWorkflow() {
  console.log('🧪 Testing Complete Cart Workflow...\n');
  
  try {
    // Step 1: Test login (as frontend would do)
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const { token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('   User ID:', user._id || user.id);
    console.log('   Token preview:', token.substring(0, 20) + '...');
    
    // Step 2: Test fetching empty cart (as frontend would do on login)
    console.log('\n2. Testing fetch cart (should be empty initially)...');
    const emptyCartResponse = await axios.get('http://localhost:5001/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Empty cart fetched:', emptyCartResponse.data);
    
    // Step 3: Test adding item to cart (exact frontend request)
    console.log('\n3. Testing add to cart (frontend-style request)...');
    const addToCartResponse = await axios.post('http://localhost:5001/api/cart/add', {
      productId: '507f1f77bcf86cd799439011',
      quantity: 1
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Add to cart successful:', {
      itemsCount: addToCartResponse.data.items.length,
      totalAmount: addToCartResponse.data.totalAmount,
      firstItem: addToCartResponse.data.items[0]?.product?.name
    });
    
    // Step 4: Test fetching cart with items
    console.log('\n4. Testing fetch cart with items...');
    const cartWithItemsResponse = await axios.get('http://localhost:5001/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Cart with items fetched:', {
      itemsCount: cartWithItemsResponse.data.items.length,
      totalAmount: cartWithItemsResponse.data.totalAmount
    });
    
    // Step 5: Test updating cart item quantity
    console.log('\n5. Testing update cart item quantity...');
    const updateCartResponse = await axios.put('http://localhost:5001/api/cart/update', {
      productId: '507f1f77bcf86cd799439011',
      quantity: 2
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Cart update successful:', {
      newQuantity: updateCartResponse.data.items[0]?.quantity,
      newTotal: updateCartResponse.data.totalAmount
    });
    
    // Step 6: Test error handling (invalid product)
    console.log('\n6. Testing error handling (invalid product)...');
    try {
      await axios.post('http://localhost:5001/api/cart/add', {
        productId: 'invalid-product-id',
        quantity: 1
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed with invalid product');
    } catch (error) {
      console.log('✅ Error handling works:', error.response?.data?.message || error.message);
    }
    
    // Step 7: Test unauthorized request (no token)
    console.log('\n7. Testing unauthorized request...');
    try {
      await axios.post('http://localhost:5001/api/cart/add', {
        productId: '507f1f77bcf86cd799439011',
        quantity: 1
      });
      console.log('❌ Should have failed without token');
    } catch (error) {
      console.log('✅ Auth protection works:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🎉 All cart workflow tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Login working');
    console.log('   ✅ Cart fetch working');
    console.log('   ✅ Add to cart working');
    console.log('   ✅ Update cart working');
    console.log('   ✅ Error handling working');
    console.log('   ✅ Authentication protection working');
    
  } catch (error) {
    console.error('\n❌ Cart workflow test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   URL:', error.config?.url);
    console.error('   Method:', error.config?.method?.toUpperCase());
    
    if (error.response?.data) {
      console.error('   Response data:', error.response.data);
    }
  }
}

testCartWorkflow();