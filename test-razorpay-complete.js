const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function testCompleteRazorpayIntegration() {
  console.log('🧪 Complete Razorpay Integration Test\n');

  // Test 1: Check environment variables
  console.log('1. 📋 Checking Environment Variables...');
  
  // Check backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  
  try {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    const backendHasRazorpayId = backendEnv.includes('RAZORPAY_KEY_ID=');
    const backendHasRazorpaySecret = backendEnv.includes('RAZORPAY_KEY_SECRET=');
    const frontendHasRazorpayId = frontendEnv.includes('REACT_APP_RAZORPAY_KEY_ID=');
    
    console.log(`   Backend RAZORPAY_KEY_ID: ${backendHasRazorpayId ? '✅' : '❌'}`);
    console.log(`   Backend RAZORPAY_KEY_SECRET: ${backendHasRazorpaySecret ? '✅' : '❌'}`);
    console.log(`   Frontend REACT_APP_RAZORPAY_KEY_ID: ${frontendHasRazorpayId ? '✅' : '❌'}`);
    
    if (frontendHasRazorpayId) {
      const keyMatch = frontendEnv.match(/REACT_APP_RAZORPAY_KEY_ID=(.+)/);
      if (keyMatch) {
        console.log(`   Frontend Key Value: ${keyMatch[1]}`);
      }
    }
  } catch (error) {
    console.log('   ❌ Error reading environment files:', error.message);
  }

  // Test 2: Backend API endpoints
  console.log('\n2. 🔧 Testing Backend API Endpoints...');
  
  try {
    // Test order creation
    const orderResponse = await axios.post(`${API_BASE}/payment-methods/razorpay/create-order`, {
      amount: 100,
      currency: 'INR',
      receipt: 'test_receipt_123',
      notes: { orderId: 'test_order_123' }
    });
    
    console.log('   ✅ Order creation endpoint working');
    console.log(`   Order ID: ${orderResponse.data.data.orderId}`);
    
    // Test verification endpoint (should fail with invalid data)
    try {
      await axios.post(`${API_BASE}/payment-methods/razorpay/verify`, {
        razorpay_order_id: 'invalid',
        razorpay_payment_id: 'invalid',
        razorpay_signature: 'invalid'
      });
    } catch (verifyError) {
      if (verifyError.response?.status === 500) {
        console.log('   ✅ Verification endpoint working (correctly rejected invalid data)');
      } else {
        console.log('   ⚠️  Verification endpoint response:', verifyError.response?.status);
      }
    }
    
  } catch (error) {
    console.log('   ❌ Backend API error:', error.response?.data || error.message);
  }

  // Test 3: Check if components exist
  console.log('\n3. 📁 Checking Frontend Components...');
  
  const componentsToCheck = [
    'frontend/src/components/RazorpayPayment.tsx',
    'frontend/src/services/paymentService.ts',
    'frontend/src/pages/PaymentTestPage.tsx'
  ];
  
  componentsToCheck.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${componentPath}`);
  });

  // Test 4: Check Razorpay script accessibility
  console.log('\n4. 🌐 Testing Razorpay Script Accessibility...');
  try {
    const response = await axios.get('https://checkout.razorpay.com/v1/checkout.js', {
      timeout: 5000
    });
    console.log('   ✅ Razorpay script is accessible');
  } catch (error) {
    console.log('   ❌ Razorpay script not accessible:', error.message);
  }

  // Test 5: Check payment service configuration
  console.log('\n5. ⚙️  Testing Payment Service Configuration...');
  
  try {
    const paymentServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'paymentService.ts');
    const paymentServiceContent = fs.readFileSync(paymentServicePath, 'utf8');
    
    const hasRazorpayMethods = paymentServiceContent.includes('processRazorpayPayment');
    const hasRazorpayOrder = paymentServiceContent.includes('createRazorpayOrder');
    const hasRazorpayVerify = paymentServiceContent.includes('verifyRazorpayPayment');
    
    console.log(`   processRazorpayPayment method: ${hasRazorpayMethods ? '✅' : '❌'}`);
    console.log(`   createRazorpayOrder method: ${hasRazorpayOrder ? '✅' : '❌'}`);
    console.log(`   verifyRazorpayPayment method: ${hasRazorpayVerify ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log('   ❌ Error checking payment service:', error.message);
  }

  // Test 6: Summary and recommendations
  console.log('\n6. 📊 Summary and Recommendations...');
  console.log('   To test Razorpay integration:');
  console.log('   1. Start both backend (npm start) and frontend (npm start)');
  console.log('   2. Go to http://localhost:3000/payment-test');
  console.log('   3. Select "Razorpay" from Indian payment methods');
  console.log('   4. Click "Pay with Razorpay" button');
  console.log('   5. Use test card: 4111 1111 1111 1111, any future date, any CVV');
  console.log('');
  console.log('   Common issues and solutions:');
  console.log('   - If "Razorpay Key not configured" error: Check REACT_APP_RAZORPAY_KEY_ID in frontend/.env');
  console.log('   - If "Script not loaded" error: Check internet connection');
  console.log('   - If backend errors: Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
  console.log('   - If payment fails: Check Razorpay dashboard for test mode settings');

  console.log('\n🎉 Complete Razorpay integration test finished!');
}

testCompleteRazorpayIntegration().catch(console.error);