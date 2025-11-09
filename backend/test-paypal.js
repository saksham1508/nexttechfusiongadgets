// Simple PayPal integration test
require('dotenv').config();
const paymentService = require('./services/paymentService');

async function testPayPal() {
  console.log('🧪 Testing PayPal Integration...\n');

  console.log('Environment Variables:');
  console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'Set ✅' : 'Not Set ❌');
  console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? 'Set ✅' : 'Not Set ❌');
  console.log('PAYPAL_MODE:', process.env.PAYPAL_MODE || 'sandbox (default)');
  console.log('');

  try {
    // Test PayPal order creation
    console.log('Creating PayPal test order...');
    const result = await paymentService.createPayPalOrder(
      10.00,
      'USD',
      [
        {
          name: 'Test Product',
          description: 'PayPal Integration Test',
          price: 10.00,
          quantity: 1
        }
      ],
      'http://localhost:3000/payment/success',
      'http://localhost:3000/payment/cancel'
    );

    if (result.success) {
      console.log('✅ PayPal order created successfully!');
      console.log('Order ID:', result.data.orderId);
      console.log('Status:', result.data.status);
      console.log('Approval URL:', result.data.links.find(link => link.rel === 'approve')?.href);
    } else {
      console.log('❌ PayPal order creation failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPayPal();
