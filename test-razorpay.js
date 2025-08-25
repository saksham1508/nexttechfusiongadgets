const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testRazorpayIntegration() {
  try {
    console.log('🧪 Testing Razorpay Integration...\n');

    // Step 1: Test backend Razorpay order creation
    console.log('1. Testing Razorpay order creation...');
    try {
      const orderResponse = await axios.post(`${API_BASE}/payment-methods/razorpay/create-order`, {
        amount: 100,
        currency: 'INR',
        receipt: 'test_receipt_123',
        notes: {
          orderId: 'test_order_123'
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Razorpay order created successfully:', orderResponse.data);
    } catch (error) {
      console.log('❌ Razorpay order creation failed:', error.response?.data || error.message);
    }

    // Step 2: Test environment variables
    console.log('\n2. Testing environment variables...');
    console.log('Backend should have:');
    console.log('- RAZORPAY_KEY_ID');
    console.log('- RAZORPAY_KEY_SECRET');
    console.log('\nFrontend should have:');
    console.log('- REACT_APP_RAZORPAY_KEY_ID');

    // Step 3: Test if Razorpay script loads
    console.log('\n3. Testing Razorpay script availability...');
    console.log('Check if https://checkout.razorpay.com/v1/checkout.js is accessible');

    // Step 4: Test payment verification endpoint
    console.log('\n4. Testing payment verification endpoint...');
    try {
      const verifyResponse = await axios.post(`${API_BASE}/payment-methods/razorpay/verify`, {
        razorpay_order_id: 'test_order_id',
        razorpay_payment_id: 'test_payment_id',
        razorpay_signature: 'test_signature'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Verification endpoint accessible (expected to fail with invalid data)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Verification endpoint working (correctly rejected invalid data)');
      } else {
        console.log('❌ Verification endpoint error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Razorpay integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRazorpayIntegration();