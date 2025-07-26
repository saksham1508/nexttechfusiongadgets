# Backend Setup Guide

## 🚀 Quick Start

The frontend is currently running with **mock data** because the backend server is not connected. This is normal for development and allows you to test all frontend features.

## 📋 Backend Requirements

To run the full backend server, you need:

### 1. **MongoDB Database**
```bash
# Install MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community

# Or use MongoDB Atlas (cloud):
# Sign up at: https://www.mongodb.com/atlas

# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. **Node.js Dependencies**
```bash
cd backend
npm install
```

### 3. **Environment Variables**
Update `backend/.env` with real API keys:

```env
# Database
MONGO_URI=mongodb://localhost:27017/nexttechfusiongadgets
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nexttechfusiongadgets

# Payment Providers (Get from respective providers)
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
RAZORPAY_KEY_ID=rzp_live_your_actual_razorpay_key
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret
PAYPAL_CLIENT_ID=your_actual_paypal_client_id
PAYPAL_CLIENT_SECRET=your_actual_paypal_secret
```

## 🔧 Starting the Backend

### Option 1: With MongoDB Installed Locally
```bash
# Start MongoDB service
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start the backend server
cd backend
npm start
```

### Option 2: With Docker
```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start the backend server
cd backend
npm start
```

### Option 3: With MongoDB Atlas (Cloud)
```bash
# Update MONGO_URI in .env to your Atlas connection string
# Start the backend server
cd backend
npm start
```

## 🌐 Current Status

### ✅ **Working Features (Mock Data)**
- Product browsing and search
- Shopping cart functionality
- User authentication (mock)
- Checkout process (mock payments)
- Order management
- Wishlist functionality
- Payment method selection
- All UI components and navigation

### 🔄 **Features Requiring Backend**
- Real user registration/login
- Persistent cart across sessions
- Real payment processing
- Order history storage
- Product inventory management
- Real-time notifications

## 🎯 **For Development**

The current setup is perfect for:
- **Frontend Development** - All UI components work perfectly
- **Payment Integration Testing** - Payment flows work with test data
- **User Experience Testing** - Complete user journey testing
- **Design and Layout Work** - All visual elements are functional

## 🚀 **For Production**

To deploy to production:
1. Set up MongoDB (Atlas recommended)
2. Configure real payment provider API keys
3. Set up proper environment variables
4. Deploy backend to a cloud service (Heroku, AWS, etc.)
5. Update frontend API_URL to point to production backend

## 📞 **Need Help?**

If you encounter issues:
1. Check that MongoDB is running: `mongod --version`
2. Verify environment variables are set correctly
3. Check firewall settings for port 5000
4. Review server logs for specific error messages

## 💡 **Pro Tip**

The mock data system is designed to be comprehensive, so you can:
- Test all payment methods
- Experience the complete user flow
- Develop and test new features
- Demo the application to stakeholders

The transition from mock data to real backend is seamless once the database and API keys are configured!