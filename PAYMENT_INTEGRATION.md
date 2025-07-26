# Payment Integration Guide

This document provides a comprehensive guide for the payment integration implemented in NextTechFusionGadgets.

## 🚀 Features

### Supported Payment Methods

1. **Stripe** - Credit/Debit Cards
   - Secure card processing
   - 3D Secure authentication
   - International payments
   - Subscription support

2. **Razorpay** - Indian Payment Gateway
   - UPI payments
   - Net banking
   - Wallets
   - Cards
   - EMI options

3. **PayPal** - Global Digital Wallet
   - PayPal balance
   - Linked bank accounts
   - Credit/debit cards
   - Buyer protection

4. **Google Pay** - Quick Mobile Payments
   - Saved payment methods
   - Biometric authentication
   - Quick checkout

5. **UPI** - Unified Payments Interface
   - Direct bank transfers
   - QR code payments
   - Mobile app integration
   - Real-time processing

## 🛠️ Setup Instructions

### Backend Configuration

1. **Environment Variables**
   ```bash
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Razorpay
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret

   # PayPal
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox

   # UPI Configuration
   UPI_MERCHANT_ID=your_merchant_id
   UPI_MERCHANT_KEY=your_merchant_key

   # Google Pay
   GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id
   GOOGLE_PAY_ENVIRONMENT=TEST
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   npm install razorpay @paypal/checkout-server-sdk
   ```

### Frontend Configuration

1. **Environment Variables**
   ```bash
   # Payment Configuration
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
   REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
   REACT_APP_GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id
   REACT_APP_GOOGLE_PAY_ENVIRONMENT=TEST
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install @stripe/stripe-js @stripe/react-stripe-js @paypal/react-paypal-js recharts
   ```

## 📁 File Structure

### Backend Files
```
backend/
├── services/
│   └── paymentService.js          # Payment processing logic
├── routes/
│   └── paymentRoutes.js           # Payment API endpoints
├── models/
│   └── PaymentMethod.js           # Payment method schema
└── .env.example                   # Environment variables template
```

### Frontend Files
```
frontend/
├── src/
│   ├── components/
│   │   ├── PaymentMethods.tsx     # Payment method selection
│   │   ├── StripePayment.tsx      # Stripe integration
│   │   ├── PayPalPayment.tsx      # PayPal integration
│   │   ├── UPIPayment.tsx         # UPI integration
│   │   ├── GooglePayPayment.tsx   # Google Pay integration
│   │   ├── PaymentConfig.tsx      # Admin configuration
│   │   └── PaymentAnalytics.tsx   # Payment analytics
│   ├── services/
│   │   └── paymentService.ts      # Frontend payment service
│   ├── pages/
│   │   ├── CheckoutPage.tsx       # Updated checkout page
│   │   └── PaymentDashboard.tsx   # Admin dashboard
│   └── types/
│       └── index.ts               # Payment type definitions
```

## 🔧 API Endpoints

### Payment Methods
- `GET /api/payment-methods` - Get user's payment methods
- `POST /api/payment-methods` - Add new payment method
- `PUT /api/payment-methods/:id` - Update payment method
- `DELETE /api/payment-methods/:id` - Delete payment method
- `PUT /api/payment-methods/:id/default` - Set default payment method

### Stripe
- `POST /api/payment-methods/create-intent` - Create payment intent
- `POST /api/payment-methods/confirm-intent` - Confirm payment intent

### Razorpay
- `POST /api/payment-methods/razorpay/create-order` - Create Razorpay order
- `POST /api/payment-methods/razorpay/verify` - Verify payment

### PayPal
- `POST /api/payment-methods/paypal/create-order` - Create PayPal order
- `POST /api/payment-methods/paypal/capture/:orderId` - Capture payment

### UPI
- `POST /api/payment-methods/upi/create` - Create UPI payment

### Google Pay
- `POST /api/payment-methods/googlepay/create` - Create Google Pay payment

### Webhooks
- `POST /api/payment-methods/webhooks/stripe` - Stripe webhook handler
- `POST /api/payment-methods/webhooks/razorpay` - Razorpay webhook handler

### Refunds
- `POST /api/payment-methods/refund` - Create refund

## 💳 Payment Flow

### 1. Payment Method Selection
```typescript
// User selects payment method
const handlePaymentMethodSelect = (method: PaymentMethod) => {
  setSelectedPaymentMethod(method);
};
```

### 2. Payment Processing
```typescript
// Process payment based on selected provider
switch (provider) {
  case 'stripe':
    result = await paymentService.processStripePayment(amount, paymentMethodId);
    break;
  case 'razorpay':
    result = await paymentService.processRazorpayPayment(amount, orderId, userDetails);
    break;
  // ... other providers
}
```

### 3. Order Creation
```typescript
// Create order after successful payment
const orderData = {
  orderItems,
  shippingAddress,
  paymentMethod: provider,
  paymentResult,
  totalPrice: amount
};

const order = await dispatch(createOrder(orderData));
```

## 🔒 Security Features

1. **PCI DSS Compliance**
   - No card data stored on servers
   - Tokenized payment methods
   - Secure API communications

2. **3D Secure Authentication**
   - Additional security layer for cards
   - Reduced chargeback risk
   - Compliance with regulations

3. **Webhook Verification**
   - Signature validation
   - Prevent unauthorized requests
   - Secure event processing

4. **Encryption**
   - All sensitive data encrypted
   - HTTPS for all communications
   - Secure token storage

## 📊 Analytics & Monitoring

### Payment Dashboard Features
- Revenue tracking
- Transaction analytics
- Payment method breakdown
- Success rate monitoring
- Failure analysis
- Real-time statistics

### Key Metrics
- Total revenue
- Transaction count
- Success rate
- Average order value
- Payment method usage
- Geographic distribution

## 🧪 Testing

### Test Cards (Stripe)
```
Visa: 4242424242424242
Mastercard: 5555555555554444
American Express: 378282246310005
Declined: 4000000000000002
```

### Test UPI IDs
```
success@razorpay
failure@razorpay
```

### PayPal Test Account
Use PayPal sandbox credentials for testing.

## 🚨 Error Handling

### Common Error Scenarios
1. **Insufficient Funds**
   - Display user-friendly message
   - Suggest alternative payment methods

2. **Card Declined**
   - Retry mechanism
   - Alternative payment options

3. **Network Errors**
   - Automatic retry logic
   - Offline handling

4. **Authentication Failures**
   - Clear error messages
   - Support contact information

## 🔄 Webhook Handling

### Stripe Webhooks
```javascript
// Handle payment success
case 'payment_intent.succeeded':
  await updateOrderStatus(paymentIntent.metadata.orderId, 'paid');
  break;

// Handle payment failure
case 'payment_intent.payment_failed':
  await updateOrderStatus(paymentIntent.metadata.orderId, 'failed');
  break;
```

### Razorpay Webhooks
```javascript
// Handle payment capture
case 'payment.captured':
  await updateOrderStatus(payment.order_id, 'paid');
  break;
```

## 📱 Mobile Optimization

1. **Responsive Design**
   - Mobile-first approach
   - Touch-friendly interfaces
   - Optimized for small screens

2. **App Integration**
   - Deep links for UPI apps
   - Google Pay integration
   - PayPal mobile SDK

3. **Performance**
   - Lazy loading
   - Optimized images
   - Fast checkout flow

## 🌍 Internationalization

### Supported Currencies
- USD (United States Dollar)
- EUR (Euro)
- GBP (British Pound)
- INR (Indian Rupee)
- CAD (Canadian Dollar)

### Regional Features
- **India**: UPI, Razorpay, Google Pay
- **US/EU**: Stripe, PayPal
- **Global**: PayPal, Stripe (where available)

## 🔧 Maintenance

### Regular Tasks
1. **Update Dependencies**
   - Keep payment SDKs updated
   - Security patches
   - Feature updates

2. **Monitor Webhooks**
   - Check webhook delivery
   - Handle failed webhooks
   - Update endpoint URLs

3. **Review Analytics**
   - Monitor success rates
   - Analyze failure patterns
   - Optimize payment flow

### Troubleshooting
1. **Payment Failures**
   - Check API keys
   - Verify webhook endpoints
   - Review error logs

2. **Integration Issues**
   - Test in sandbox mode
   - Verify configuration
   - Check network connectivity

## 📞 Support

For payment-related issues:
1. Check the error logs
2. Verify API credentials
3. Test in sandbox mode
4. Contact payment provider support
5. Review webhook delivery

## 🚀 Future Enhancements

1. **Additional Payment Methods**
   - Apple Pay
   - Samsung Pay
   - Cryptocurrency payments
   - Buy now, pay later options

2. **Advanced Features**
   - Subscription billing
   - Multi-currency support
   - Advanced fraud detection
   - Payment scheduling

3. **Analytics Improvements**
   - Predictive analytics
   - Customer insights
   - Revenue forecasting
   - A/B testing for checkout

---

This payment integration provides a robust, secure, and user-friendly payment experience for NextTechFusionGadgets customers while giving administrators powerful tools to manage and monitor payment operations.