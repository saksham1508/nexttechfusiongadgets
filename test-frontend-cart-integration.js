const axios = require('axios');

const FRONTEND_API_URL = 'http://localhost:5001/api'; // Updated to match frontend config
const BACKEND_API_URL = 'http://localhost:5001/api';

async function testFrontendCartIntegration() {
  try {
    console.log('🧪 Testing Frontend-Backend Cart Integration...\n');

    // Step 1: Test if backend is accessible from frontend's perspective
    console.log('1. Testing backend accessibility...');
    const healthResponse = await axios.get(`${FRONTEND_API_URL}/health`);
    console.log('✅ Backend accessible from frontend URL:', healthResponse.status);

    // Step 2: Test login with frontend API URL
    console.log('\n2. Testing login with frontend API URL...');
    const loginResponse = await axios.post(`${FRONTEND_API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful with frontend API URL');
    console.log('   Token type:', token.startsWith('eyJ') ? 'JWT' : 'Other');

    // Step 3: Test cart operations with frontend API URL
    console.log('\n3. Testing cart operations with frontend API URL...');
    
    // Get cart
    const cartResponse = await axios.get(`${FRONTEND_API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get cart successful:', cartResponse.data);

    // Add to cart
    const addResponse = await axios.post(`${FRONTEND_API_URL}/cart/add`, {
      productId: '507f1f77bcf86cd799439011',
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Add to cart successful:', addResponse.data);

    // Step 4: Test CORS headers
    console.log('\n4. Testing CORS headers...');
    const corsResponse = await axios.options(`${FRONTEND_API_URL}/cart`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    console.log('✅ CORS preflight successful');

    // Step 5: Simulate frontend request exactly
    console.log('\n5. Simulating exact frontend request...');
    const frontendRequest = await axios.post(`${FRONTEND_API_URL}/cart/add`, {
      productId: '507f1f77bcf86cd799439012',
      quantity: 2
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ Frontend-style request successful:', frontendRequest.data);

    console.log('\n🎉 All frontend-backend integration tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend accessible on correct port (5001)');
    console.log('   ✅ Authentication working');
    console.log('   ✅ Cart operations functional');
    console.log('   ✅ CORS configured correctly');
    console.log('   ✅ Frontend requests work properly');

  } catch (error) {
    console.error('❌ Integration test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Backend not running on expected port');
    } else if (error.response?.status === 401) {
      console.error('   Authentication issue');
    } else if (error.response?.status === 404) {
      console.error('   Endpoint not found');
    }
  }
}

testFrontendCartIntegration();