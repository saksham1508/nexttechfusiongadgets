const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function debugRazorpayPayment() {
  console.log('🔍 Debugging Razorpay Payment Issue\n');

  try {
    // Test 1: Check backend configuration
    console.log('1. 🔧 Testing Backend Configuration...');
    
    // Test order creation with detailed logging
    console.log('   Creating test order...');
    const orderResponse = await axios.post(`${API_BASE}/payment-methods/razorpay/create-order`, {
      amount: 100, // ₹1.00
      currency: 'INR',
      receipt: 'test_receipt_debug',
      notes: { 
        orderId: 'debug_order_123',
        testMode: true 
      }
    });
    
    if (orderResponse.data.success) {
      console.log('   ✅ Order creation successful');
      console.log('   Order Details:', JSON.stringify(orderResponse.data.data, null, 2));
      
      const orderData = orderResponse.data.data;
      
      // Test 2: Simulate payment verification with invalid data
      console.log('\n2. 🧪 Testing Payment Verification...');
      
      try {
        const verifyResponse = await axios.post(`${API_BASE}/payment-methods/razorpay/verify`, {
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: 'pay_test_invalid',
          razorpay_signature: 'invalid_signature'
        });
        
        console.log('   ⚠️  Verification unexpectedly succeeded:', verifyResponse.data);
      } catch (verifyError) {
        if (verifyError.response?.status === 400 || verifyError.response?.status === 500) {
          console.log('   ✅ Verification correctly rejected invalid data');
          console.log('   Error:', verifyError.response.data.message);
        } else {
          console.log('   ❌ Unexpected verification error:', verifyError.message);
        }
      }
      
    } else {
      console.log('   ❌ Order creation failed:', orderResponse.data.error);
    }

  } catch (error) {
    console.log('   ❌ Backend test failed:', error.response?.data || error.message);
  }

  // Test 3: Check frontend environment
  console.log('\n3. 🌐 Frontend Environment Check...');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    const hasRazorpayId = frontendEnv.includes('REACT_APP_RAZORPAY_KEY_ID=');
    const keyMatch = frontendEnv.match(/REACT_APP_RAZORPAY_KEY_ID=(.+)/);
    
    console.log(`   Frontend Key Configured: ${hasRazorpayId ? '✅' : '❌'}`);
    if (keyMatch) {
      console.log(`   Key Value: ${keyMatch[1]}`);
    }
    
  } catch (error) {
    console.log('   ❌ Could not read frontend .env:', error.message);
  }

  // Test 4: Common issues and solutions
  console.log('\n4. 🛠️  Common Issues and Solutions...');
  console.log(`   
  Common Razorpay Payment Failure Causes:
  
  🔸 Frontend Issues:
     - REACT_APP_RAZORPAY_KEY_ID not set or incorrect
     - Razorpay script not loading (network issues)
     - Amount conversion issues (paise vs rupees)
     - Browser blocking popups
  
  🔸 Backend Issues:
     - RAZORPAY_KEY_SECRET not set or incorrect
     - Order creation failing due to invalid parameters
     - Payment verification failing due to signature mismatch
     - Network connectivity issues with Razorpay API
  
  🔸 Razorpay Account Issues:
     - Test mode not enabled
     - Invalid API keys
     - Account not activated
     - Payment methods not enabled
  
  🔧 Debugging Steps:
     1. Check browser console for JavaScript errors
     2. Check network tab for failed API calls
     3. Verify environment variables are loaded
     4. Test with Razorpay test card: 4111 1111 1111 1111
     5. Check backend logs for detailed error messages
  `);

  // Test 5: Generate test payment flow
  console.log('\n5. 🧪 Test Payment Flow Instructions...');
  console.log(`
  To test the payment flow:
  
  1. Start both servers:
     Backend: cd backend && npm start
     Frontend: cd frontend && npm start
  
  2. Open browser console (F12) to see detailed logs
  
  3. Go to: http://localhost:3000/payment-test
  
  4. Select Razorpay payment method
  
  5. Click "Pay with Razorpay"
  
  6. Use test card details:
     Card: 4111 1111 1111 1111
     Expiry: Any future date (e.g., 12/25)
     CVV: Any 3 digits (e.g., 123)
     Name: Test User
  
  7. Check console logs for:
     - Order creation logs
     - Razorpay checkout opening
     - Payment success/failure
     - Verification results
  
  Expected Console Output:
  🔄 Starting Razorpay payment process...
  📝 Creating Razorpay order...
  ✅ Order created: {...}
  🚀 Opening Razorpay checkout...
  💳 Payment successful, verifying...
  ✅ Payment verified: {...}
  `);

  console.log('\n🎯 Debug session completed!');
}

debugRazorpayPayment().catch(console.error);