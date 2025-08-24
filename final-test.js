// Final comprehensive test script (expanded)
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function runFinalTests() {
  console.log('🎯 FINAL VERIFICATION - All Bug Fixes & API Tests\n');
  console.log('='.repeat(70));

  let passedTests = 0;
  let totalTests = 0;

  const incTotal = () => { totalTests++; };
  const pass = (name) => { console.log(`✅ ${name} - PASSED`); passedTests++; };
  const fail = (name, msg) => { console.log(`❌ ${name} - FAILED`); if (msg) console.log('   ' + msg); };

  const http = axios.create({ timeout: 8000 });

  // Helper: Safe request with name
  async function test(name, fn) {
    incTotal();
    try { await fn(); pass(name); } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const msg = status ? `Status: ${status} | Body: ${JSON.stringify(data)}` : (e?.message || String(e));
      fail(name, msg);
    }
  }

  let mode = 'unknown';
  let userToken = null; // customer token
  const vendorToken = 'mock_vendor_token_vendor_1'; // seller token via mock authFallback
  let createdProductId = null;
  const cartProductId = 'product_1'; // any id works in mock cart controller
  const sessionId = `session_${Date.now()}`; // for chat

  // Test 1: Backend Health
  await test('Test 1: Backend Health Check', async () => {
    const res = await http.get(`${BACKEND_URL}/api/health`);
    if (!res.data?.status) throw new Error('Missing status in health response');
    console.log(`   Status: ${res.data.status}`);
  });

  // Test 2: Backend Status
  await test('Test 2: Backend Status', async () => {
    const res = await http.get(`${BACKEND_URL}/api/status`);
    if (res.data?.status !== 'operational') throw new Error('Unexpected backend status');
    console.log(`   Uptime: ${res.data?.uptime?.human}, Cache fallback: ${res.data?.cache?.fallbackActive}`);
  });

  // Test 3: API Docs
  await test('Test 3: API Docs Available', async () => {
    const res = await http.get(`${BACKEND_URL}/api/docs`);
    if (!res.data?.endpoints?.products) throw new Error('Products docs missing');
  });

  // Test 4: Auth Mode Status
  await test('Test 4: Auth Status (mock/real)', async () => {
    const res = await http.get(`${BACKEND_URL}/api/auth/status`);
    if (!res.data?.success) throw new Error('Auth status did not return success');
    mode = res.data?.mode; // 'mock' or 'real'
    console.log(`   Auth Mode: ${mode}`);
  });

  // Test 5: Frontend Accessibility (non-fatal)
  incTotal();
  try {
    await http.get(FRONTEND_URL);
    console.log('✅ Test 5: Frontend Accessibility - PASSED');
    console.log('   Frontend running on port 3000');
    passedTests++;
  } catch (error) {
    console.log('⚠️  Test 5: Frontend Accessibility - SKIPPED');
    console.log('   Frontend not accessible; continue with backend API tests');
  }

  // Test 6: API Error Handling (409 Conflict on duplicate register)
  await test('Test 6: Register duplicate (expect 409)', async () => {
    const testUser = { name: 'Test User', email: 'admin@example.com', password: 'password123', phone: '+1234567890' };
    try {
      await http.post(`${BACKEND_URL}/api/auth/register`, testUser);
      throw new Error('Expected 409 conflict but got success');
    } catch (e) {
      if (e?.response?.status !== 409) throw e;
      console.log('   Properly returns 409 for duplicate user');
    }
  });

  // Test 7: API Error Handling (401 Unauthorized on bad login)
  await test('Test 7: Login invalid creds (expect 401)', async () => {
    try {
      await http.post(`${BACKEND_URL}/api/auth/login`, { email: 'nonexistent@example.com', password: 'wrongpassword' });
      throw new Error('Expected 401 unauthorized but got success');
    } catch (e) {
      if (e?.response?.status !== 401) throw e;
      console.log('   Properly returns 401 for invalid credentials');
    }
  });

  // Test 8: Login (mock/real) -> token
  await test('Test 8: Login success returns token', async () => {
    const res = await http.post(`${BACKEND_URL}/api/auth/login`, { email: 'test@example.com', password: 'testpassword' });
    const token = res.data?.token;
    if (!token) throw new Error('Missing token in login response');
    userToken = token;
    console.log(`   User: ${res.data?.user?.email}, Role: ${res.data?.user?.role}`);
  });

  // Test 9: Get Profile with token
  await test('Test 9: Get Profile (authorized)', async () => {
    if (!userToken) throw new Error('No user token from login');
    const res = await http.get(`${BACKEND_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!res.data?.success && !res.data?.email && !res.data?.user) {
      // mock controller returns success wrapper; real may return user
      throw new Error('Unexpected profile response');
    }
  });

  // Test 10: Products API (list)
  await test('Test 10: Products list', async () => {
    const res = await http.get(`${BACKEND_URL}/api/products`);
    const products = res.data?.data?.products ?? res.data?.products;
    if (!Array.isArray(products)) throw new Error('Products array missing');
    console.log(`   Retrieved ${products.length} products`);
  });

  // Test 11: Products search API
  await test('Test 11: Products search', async () => {
    const res = await http.get(`${BACKEND_URL}/api/products/search`, { params: { q: 'Pro' } });
    const products = res.data?.data?.products ?? [];
    if (!Array.isArray(products)) throw new Error('Search products missing');
  });

  // Test 12: Product CRUD with seller token
  await test('Test 12: Create/Update/Delete Product (seller auth)', async () => {
    // Create
    const createRes = await http.post(`${BACKEND_URL}/api/products`, {
      name: `Test Product ${Date.now()}`,
      description: 'Test product via final-test suite',
      price: 1999,
      category: 'Testing',
      brand: 'QA',
      countInStock: 5,
      images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300']
    }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    const product = createRes.data?.data?.product;
    if (!product?._id) throw new Error('Product not created');
    createdProductId = product._id;

    // Duplicate create (expect 409)
    try {
      await http.post(`${BACKEND_URL}/api/products`, {
        name: product.name,
        description: 'Duplicate attempt',
        price: 1999,
        category: 'Testing',
        brand: product.brand,
        countInStock: 1
      }, { headers: { Authorization: `Bearer ${vendorToken}` } });
      throw new Error('Expected 409 on duplicate product');
    } catch (e) {
      if (e?.response?.status !== 409) throw e;
    }

    // Update
    const newPrice = product.price + 100;
    const updateRes = await http.put(`${BACKEND_URL}/api/products/${createdProductId}`, {
      price: newPrice
    }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    const updated = updateRes.data?.data?.product;
    if (!updated || updated.price !== newPrice) throw new Error('Product not updated');

    // Delete
    const delRes = await http.delete(`${BACKEND_URL}/api/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    if (!delRes.data?.success) throw new Error('Product not deleted');
  });

  // Test 13: Cart Flow (customer auth)
  await test('Test 13: Cart flow (add, update, remove, clear)', async () => {
    if (!userToken) throw new Error('No user token from login');

    // Start with clear
    await http.delete(`${BACKEND_URL}/api/cart/clear`, { headers: { Authorization: `Bearer ${userToken}` } });

    // Add item
    const addRes = await http.post(`${BACKEND_URL}/api/cart/add`, {
      productId: cartProductId,
      quantity: 2
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    const itemsAfterAdd = addRes.data?.items || [];
    if (!Array.isArray(itemsAfterAdd) || itemsAfterAdd.length === 0) throw new Error('Cart add failed');

    // Update quantity
    const updRes = await http.put(`${BACKEND_URL}/api/cart/update`, {
      productId: cartProductId,
      quantity: 3
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    const itemsAfterUpd = updRes.data?.items || [];
    const updatedItem = itemsAfterUpd.find(i => (i.product?._id || i.product) === cartProductId);
    if (!updatedItem || updatedItem.quantity !== 3) throw new Error('Cart update failed');

    // Remove
    const remRes = await http.delete(`${BACKEND_URL}/api/cart/remove/${cartProductId}`, { headers: { Authorization: `Bearer ${userToken}` } });
    const itemsAfterRem = remRes.data?.items || [];
    if (itemsAfterRem.find(i => (i.product?._id || i.product) === cartProductId)) throw new Error('Cart remove failed');

    // Clear at end
    await http.delete(`${BACKEND_URL}/api/cart/clear`, { headers: { Authorization: `Bearer ${userToken}` } });
  });

  // Test 14: Chat API (public with optional auth)
  await test('Test 14: Chat message + history', async () => {
    const msgRes = await http.post(`${BACKEND_URL}/api/chat/message`, {
      message: 'Show me the latest iPhone',
      sessionId
    });
    if (!msgRes.data?.success || !msgRes.data?.response) throw new Error('Chat response missing');

    const histRes = await http.get(`${BACKEND_URL}/api/chat/history/${sessionId}`, { params: { limit: 5 } });
    if (!histRes.data?.success || !Array.isArray(histRes.data?.history)) throw new Error('Chat history missing');
  });

  console.log('\n' + '='.repeat(70));
  console.log(`📊 FINAL RESULTS: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Application is ready for use.');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.');
  }

  console.log('\n🚀 READY TO TEST IN BROWSER:');
  console.log(`1. Open ${FRONTEND_URL}`);
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Check Console tab for:');
  console.log('   ✅ No Chrome extension errors');
  console.log('   ✅ No DOM autocomplete warnings');
  console.log('   ✅ No setInterval performance warnings');
  console.log('   ✅ No VirtualTryOnPage runtime errors');
  console.log('4. Test user flows:');
  console.log('   ✅ Registration with proper error messages');
  console.log('   ✅ Login with token persistence');
  console.log('   ✅ Cart operations after authentication');
  console.log('   ✅ Virtual Try-On page navigation');
}

runFinalTests().catch((e) => {
  console.error('❌ Test runner error:', e?.message || e);
  process.exitCode = 1;
});