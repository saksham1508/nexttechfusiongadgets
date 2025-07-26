# 🔑 API Keys Configuration Guide

## Required API Keys for Full Functionality

### **1. Payment Gateways**

#### **Stripe** (Credit/Debit Cards)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or login
3. Get your keys from API section:
   ```env
   STRIPE_SECRET_KEY=sk_test_51...
   STRIPE_PUBLISHABLE_KEY=pk_test_51...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### **Razorpay** (India-focused payments)
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create account and complete KYC
3. Get API keys:
   ```env
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

#### **PayPal** (Global digital wallet)
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create application
3. Get credentials:
   ```env
   PAYPAL_CLIENT_ID=A...
   PAYPAL_CLIENT_SECRET=E...
   PAYPAL_MODE=sandbox
   ```

#### **Google Pay** (Mobile payments)
1. Go to [Google Pay Console](https://pay.google.com/business/console/)
2. Set up merchant account
3. Configure:
   ```env
   GOOGLE_PAY_MERCHANT_ID=...
   GOOGLE_PAY_ENVIRONMENT=TEST
   ```

### **2. AI Services**

#### **OpenAI** (AI-powered features)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and add billing
3. Generate API key:
   ```env
   OPENAI_API_KEY=sk-...
   ```

### **3. Cloud Services**

#### **Cloudinary** (Image management)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create free account
3. Get credentials from dashboard:
   ```env
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

#### **MongoDB Atlas** (Cloud database - optional)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexttechfusiongadgets
   ```

### **4. Email Services**

#### **Gmail SMTP** (Email notifications)
1. Enable 2-factor authentication on Gmail
2. Generate app password
3. Configure:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### **5. Security Keys**

#### **JWT Secret** (Authentication)
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **Encryption Key** (Data encryption)
Generate 32-character key:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## **Quick Setup Commands**

### **Test Mode Setup** (for development)
```bash
# Copy example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Use test/sandbox keys for all services
# This allows you to test without real transactions
```

### **Production Setup Checklist**
- [ ] All API keys are production keys (not test/sandbox)
- [ ] Strong JWT secret generated
- [ ] Encryption key generated and stored securely
- [ ] Database connection secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Monitoring configured

## **Testing Your Configuration**

### **Backend API Test**
```bash
cd backend
npm run test:config
```

### **Payment Gateway Test**
```bash
# Test each payment method
curl -X POST http://localhost:5000/api/payment-methods/test
```

### **Frontend Integration Test**
```bash
cd frontend
npm run test:integration
```

## **Security Best Practices**

1. **Never commit API keys to version control**
2. **Use different keys for development and production**
3. **Regularly rotate API keys**
4. **Monitor API usage and set up alerts**
5. **Use environment variables for all sensitive data**
6. **Enable webhook signature verification**
7. **Set up proper CORS policies**

## **Troubleshooting**

### **Common Issues**

#### **Stripe Webhook Issues**
- Ensure webhook endpoint is publicly accessible
- Verify webhook secret matches
- Check webhook event types are configured

#### **Razorpay Integration Issues**
- Complete KYC verification
- Ensure test mode is enabled for development
- Check webhook URL configuration

#### **OpenAI API Issues**
- Verify billing is set up
- Check API usage limits
- Ensure correct model permissions

#### **Database Connection Issues**
- Verify MongoDB is running
- Check connection string format
- Ensure network access is allowed

## **Support Resources**

- **Stripe**: [Documentation](https://stripe.com/docs)
- **Razorpay**: [Documentation](https://razorpay.com/docs/)
- **PayPal**: [Developer Docs](https://developer.paypal.com/docs/)
- **OpenAI**: [API Reference](https://platform.openai.com/docs/)
- **MongoDB**: [Atlas Docs](https://docs.atlas.mongodb.com/)

---

**Next Step**: After configuring all API keys, run the test suite to verify everything is working correctly.