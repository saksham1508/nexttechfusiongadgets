const axios = require('axios');

async function testFrontendDirect() {
  try {
    console.log('🧪 Testing Frontend Direct Access...\n');

    // Test if frontend is running
    console.log('1. Testing frontend accessibility...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
      console.log('✅ Frontend accessible on port 3000');
    } catch (error) {
      console.log('❌ Frontend not accessible on port 3000');
      
      // Try other common ports
      const ports = [3001, 3002, 3003];
      for (const port of ports) {
        try {
          await axios.get(`http://localhost:${port}`, { timeout: 2000 });
          console.log(`✅ Frontend found on port ${port}`);
          break;
        } catch (e) {
          console.log(`❌ Frontend not on port ${port}`);
        }
      }
    }

    // Test API configuration
    console.log('\n2. Testing API configuration...');
    const apiUrl = 'http://localhost:5001/api';
    
    try {
      const healthCheck = await axios.get(`${apiUrl}/health`);
      console.log('✅ Backend API accessible:', healthCheck.status);
    } catch (error) {
      console.log('❌ Backend API not accessible');
      return;
    }

    // Test demo login
    console.log('\n3. Testing demo login...');
    const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Demo login successful');
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Token valid:', token.startsWith('eyJ'));

    // Test cart functionality
    console.log('\n4. Testing cart functionality...');
    
    // Clear cart first
    await axios.delete(`${apiUrl}/cart/clear`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Add item to cart
    const addResponse = await axios.post(`${apiUrl}/cart/add`, {
      productId: '507f1f77bcf86cd799439011',
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Add to cart successful');
    console.log('   Items in cart:', addResponse.data.items.length);
    console.log('   Total amount:', addResponse.data.totalAmount);

    console.log('\n🎉 All direct tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Open http://localhost:3000 (or the correct port)');
    console.log('   2. Login with test@example.com / testpassword');
    console.log('   3. Try adding items to cart');
    console.log('   4. Check browser console for any errors');

  } catch (error) {
    console.error('❌ Direct test failed:', error.response?.data || error.message);
  }
}

testFrontendDirect();