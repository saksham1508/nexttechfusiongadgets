// Test PhonePe API from frontend
const testPhonePeAPI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/payment-methods/phonepe/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        orderId: 'test_order_123',
        currency: 'INR',
        userPhone: '9999999999'
      })
    });

    const data = await response.json();
    console.log('PhonePe API Response:', data);
    
    if (data.success) {
      console.log('✅ PhonePe API working correctly');
      console.log('Transaction ID:', data.data.transactionId);
      console.log('Mock Mode:', data.data.mockMode);
    } else {
      console.error('❌ PhonePe API failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Run the test
testPhonePeAPI();