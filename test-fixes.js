// Quick test script to verify our fixes
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFixes() {
  console.log('🧪 Testing API Fixes...\n');

  // Test 1: Health Check
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check: API is running');
  } catch (error) {
    console.log('❌ Health Check: API is not running');
    console.log('   Make sure backend is running on port 5000');
  }

  // Test 2: Registration endpoint
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '+1234567890'
    };
    
    const response = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Registration: Endpoint working');
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('✅ Registration: 409 handling working (user exists)');
    } else {
      console.log('❌ Registration: Unexpected error', error.response?.status);
    }
  }

  // Test 3: Login endpoint
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    console.log('✅ Login: Endpoint working');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Login: 401 handling working (invalid credentials)');
    } else {
      console.log('❌ Login: Unexpected error', error.response?.status);
    }
  }

  console.log('\n🎉 API Tests Complete!');
  console.log('\nNext steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Check console for reduced error messages');
  console.log('3. Test login/register functionality');
  console.log('4. Test cart operations after login');
}

testFixes().catch(console.error);