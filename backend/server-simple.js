const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Payment gateway imports
const Razorpay = require('razorpay');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Razorpay (with error handling for missing secrets)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
    !process.env.RAZORPAY_KEY_SECRET.includes('PLEASE_ADD')) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.log('⚠️ Razorpay not initialized - missing secret key');
}

// Initialize PayPal (with error handling for missing secrets)
let paypalClient = null;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && 
    !process.env.PAYPAL_CLIENT_SECRET.includes('PLEASE_ADD')) {
  const environment = process.env.PAYPAL_MODE === 'live' 
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  paypalClient = new paypal.core.PayPalHttpClient(environment);
  console.log('✅ PayPal initialized successfully');
} else {
  console.log('⚠️ PayPal not initialized - missing secret key');
}

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'NextTechFusionGadgets API is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock vendor analytics (simple server)
app.get('/api/vendor/analytics', (req, res) => {
  // In simple server we don't have auth/user. Return static-ish mock data.
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }

  const productMonthly = [
    { productId: '1', name: 'iPhone 15 Pro', months, series: [5,6,8,7,9,12,10,11,13,12,14,16] },
    { productId: '3', name: 'MacBook Pro M3', months, series: [2,3,2,4,3,5,4,6,5,7,6,8] },
    { productId: '6', name: 'Sony WH-1000XM5', months, series: [7,8,6,7,8,9,10,9,8,10,11,12] },
  ];

  const productOrders = [
    { productId: '1', name: 'iPhone 15 Pro', views: 1200, orders: 160 },
    { productId: '6', name: 'Sony WH-1000XM5', views: 900, orders: 110 },
    { productId: '3', name: 'MacBook Pro M3', views: 600, orders: 70 },
  ];

  const totalViews = productOrders.reduce((s, p) => s + p.views, 0);
  const totalOrders = productOrders.reduce((s, p) => s + p.orders, 0);
  const conversionRate = +(totalViews ? ((totalOrders / totalViews) * 100).toFixed(2) : 0);
  const totalSales = 160*999.99 + 110*349.99 + 70*1999.99;

  res.json({
    success: true,
    data: {
      summary: {
        totalClicks: totalViews, // treat views as clicks in mock
        totalViews,
        totalOrders,
        conversionRate,
        totalSales: +totalSales.toFixed(2),
        returnPercentage: 2.5
      },
      productOrders,
      productMonthly
    }
  });
});

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'NextTechFusionGadgets API is running!',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      orders: '/api/orders'
    }
  });
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  const products = [
    {
      _id: '1',
      name: 'iPhone 15 Pro',
      price: 999.99,
      originalPrice: 1099.99,
      description: 'Latest iPhone with advanced features and A17 Pro chip',
      category: 'smartphones',
      brand: 'Apple',
      countInStock: 50,
      stock: 50,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro', alt: 'iPhone 15 Pro' }
      ],
      rating: 4.8,
      numReviews: 125,
      isActive: true,
      tags: ['smartphone', 'apple', 'premium'],
      warranty: '1 year',
      seller: { _id: 'seller1', name: 'Apple Store' },
      specifications: {
        'Display': '6.1-inch Super Retina XDR',
        'Chip': 'A17 Pro',
        'Storage': '128GB, 256GB, 512GB, 1TB',
        'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Samsung Galaxy S24',
      price: 899.99,
      originalPrice: 999.99,
      description: 'Flagship Android smartphone with AI features',
      category: 'smartphones',
      brand: 'Samsung',
      countInStock: 30,
      stock: 30,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=Galaxy+S24', alt: 'Samsung Galaxy S24' }
      ],
      rating: 4.7,
      numReviews: 98,
      isActive: true,
      tags: ['smartphone', 'samsung', 'android'],
      warranty: '1 year',
      seller: { _id: 'seller2', name: 'Samsung Store' },
      specifications: {
        'Display': '6.2-inch Dynamic AMOLED 2X',
        'Processor': 'Snapdragon 8 Gen 3',
        'Storage': '128GB, 256GB',
        'Camera': '50MP Main, 12MP Ultra Wide, 10MP Telephoto'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'MacBook Pro M3',
      price: 1999.99,
      originalPrice: 2199.99,
      description: 'Professional laptop with M3 chip for creative professionals',
      category: 'laptops',
      brand: 'Apple',
      countInStock: 20,
      stock: 20,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=MacBook+Pro', alt: 'MacBook Pro M3' }
      ],
      rating: 4.9,
      numReviews: 87,
      isActive: true,
      tags: ['laptop', 'apple', 'professional'],
      warranty: '1 year',
      seller: { _id: 'seller1', name: 'Apple Store' },
      specifications: {
        'Processor': 'Apple M3',
        'RAM': '16GB',
        'Storage': '512GB SSD',
        'Display': '14-inch Liquid Retina XDR'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '4',
      name: 'AirPods Pro 2',
      price: 249.99,
      originalPrice: 279.99,
      description: 'Wireless earbuds with active noise cancellation',
      category: 'audio',
      brand: 'Apple',
      countInStock: 100,
      stock: 100,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=AirPods+Pro', alt: 'AirPods Pro 2' }
      ],
      rating: 4.6,
      numReviews: 156,
      isActive: true,
      tags: ['earbuds', 'apple', 'wireless'],
      warranty: '1 year',
      seller: { _id: 'seller1', name: 'Apple Store' },
      specifications: {
        'Battery': '6 hours (ANC on)',
        'Connectivity': 'Bluetooth 5.3',
        'Features': 'Active Noise Cancellation, Spatial Audio',
        'Case Battery': '30 hours total'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '5',
      name: 'iPad Air',
      price: 599.99,
      originalPrice: 649.99,
      description: 'Versatile tablet for work and creative projects',
      category: 'tablets',
      brand: 'Apple',
      countInStock: 40,
      stock: 40,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=iPad+Air', alt: 'iPad Air' }
      ],
      rating: 4.5,
      numReviews: 73,
      isActive: true,
      tags: ['tablet', 'apple', 'creative'],
      warranty: '1 year',
      seller: { _id: 'seller1', name: 'Apple Store' },
      specifications: {
        'Display': '10.9-inch Liquid Retina',
        'Chip': 'M1',
        'Storage': '64GB, 256GB',
        'Camera': '12MP Wide, 12MP Ultra Wide Front'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '6',
      name: 'Sony WH-1000XM5',
      price: 349.99,
      originalPrice: 399.99,
      description: 'Industry-leading noise canceling headphones',
      category: 'audio',
      brand: 'Sony',
      countInStock: 60,
      stock: 60,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=Sony+WH-1000XM5', alt: 'Sony WH-1000XM5' }
      ],
      rating: 4.8,
      numReviews: 245,
      isActive: true,
      tags: ['headphones', 'sony', 'noise-canceling'],
      warranty: '1 year',
      seller: { _id: 'seller3', name: 'Sony Store' },
      specifications: {
        'Battery': '30 hours',
        'Connectivity': 'Bluetooth 5.2',
        'Features': 'Industry-leading ANC, Quick Charge',
        'Weight': '250g'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '7',
      name: 'Dell XPS 13',
      price: 1299.99,
      originalPrice: 1399.99,
      description: 'Ultra-portable laptop with InfinityEdge display',
      category: 'laptops',
      brand: 'Dell',
      countInStock: 25,
      stock: 25,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=Dell+XPS+13', alt: 'Dell XPS 13' }
      ],
      rating: 4.5,
      numReviews: 189,
      isActive: true,
      tags: ['laptop', 'dell', 'ultrabook'],
      warranty: '1 year',
      seller: { _id: 'seller4', name: 'Dell Store' },
      specifications: {
        'Processor': 'Intel Core i7',
        'RAM': '16GB',
        'Storage': '512GB SSD',
        'Display': '13.4-inch FHD+ InfinityEdge'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '8',
      name: 'PlayStation 5',
      price: 499.99,
      originalPrice: 549.99,
      description: 'Next-generation gaming console with 4K gaming',
      category: 'gaming',
      brand: 'Sony',
      countInStock: 15,
      stock: 15,
      images: [
        { url: 'https://via.placeholder.com/300x300?text=PlayStation+5', alt: 'PlayStation 5' }
      ],
      rating: 4.9,
      numReviews: 892,
      isActive: true,
      tags: ['gaming', 'console', 'sony'],
      warranty: '1 year',
      seller: { _id: 'seller3', name: 'Sony Store' },
      specifications: {
        'Storage': '825GB SSD',
        'Resolution': '4K at 120fps',
        'CPU': 'AMD Zen 2',
        'GPU': 'AMD RDNA 2'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    products: products,
    page: 1,
    pages: 1,
    total: products.length
  });
});

// Mock product by ID endpoint
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  const products = {
    '1': {
      _id: '1',
      name: 'iPhone 15 Pro',
      price: 999.99,
      originalPrice: 1099.99,
      description: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and advanced camera system.',
      category: 'smartphones',
      brand: 'Apple',
      countInStock: 50,
      stock: 50,
      images: [
        { url: 'https://via.placeholder.com/600x600?text=iPhone+15+Pro+Front', alt: 'iPhone 15 Pro Front' },
        { url: 'https://via.placeholder.com/600x600?text=iPhone+15+Pro+Back', alt: 'iPhone 15 Pro Back' }
      ],
      rating: 4.8,
      numReviews: 125,
      isActive: true,
      tags: ['smartphone', 'apple', 'premium'],
      warranty: '1 year',
      seller: { _id: 'seller1', name: 'Apple Store' },
      specifications: {
        'Display': '6.1-inch Super Retina XDR',
        'Chip': 'A17 Pro',
        'Storage': '128GB, 256GB, 512GB, 1TB',
        'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
        'Battery': 'Up to 23 hours video playback'
      },
      reviews: [
        {
          _id: '1',
          user: 'John Doe',
          rating: 5,
          comment: 'Amazing phone with great camera quality!',
          date: '2024-01-15'
        },
        {
          _id: '2',
          user: 'Jane Smith',
          rating: 4,
          comment: 'Good performance but expensive.',
          date: '2024-01-10'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    '2': {
      _id: '2',
      name: 'Samsung Galaxy S24',
      price: 899.99,
      originalPrice: 999.99,
      description: 'Samsung Galaxy S24 with AI-powered features and exceptional display.',
      category: 'smartphones',
      brand: 'Samsung',
      countInStock: 30,
      stock: 30,
      images: [
        { url: 'https://via.placeholder.com/600x600?text=Galaxy+S24+Front', alt: 'Galaxy S24 Front' },
        { url: 'https://via.placeholder.com/600x600?text=Galaxy+S24+Back', alt: 'Galaxy S24 Back' }
      ],
      rating: 4.7,
      numReviews: 98,
      isActive: true,
      tags: ['smartphone', 'samsung', 'android'],
      warranty: '1 year',
      seller: { _id: 'seller2', name: 'Samsung Store' },
      specifications: {
        'Display': '6.2-inch Dynamic AMOLED 2X',
        'Processor': 'Snapdragon 8 Gen 3',
        'Storage': '128GB, 256GB',
        'Camera': '50MP Main, 12MP Ultra Wide, 10MP Telephoto',
        'Battery': '4000mAh'
      },
      reviews: [
        {
          _id: '3',
          user: 'Mike Johnson',
          rating: 5,
          comment: 'Excellent Android phone with great AI features!',
          date: '2024-01-12'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  const product = products[id];
  if (product) {
    res.json({
      success: true,
      data: product
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Mock successful login
  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: '1',
      name: 'Test User',
      email: email,
      role: 'user'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }
  
  // Mock successful registration
  res.json({
    success: true,
    message: 'Registration successful',
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: '2',
      name: name,
      email: email,
      role: 'user'
    }
  });
});

// Mock orders endpoint
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        status: 'delivered',
        total: 999.99,
        date: new Date().toISOString(),
        items: [
          {
            id: '1',
            name: 'iPhone 15 Pro',
            quantity: 1,
            price: 999.99,
            image: 'https://via.placeholder.com/100x100?text=iPhone'
          }
        ],
        shippingAddress: {
          address: '123 Main St',
          city: 'New York',
          postalCode: '10001',
          country: 'USA'
        }
      },
      {
        id: '2',
        status: 'processing',
        total: 249.99,
        date: new Date(Date.now() - 86400000).toISOString(),
        items: [
          {
            id: '4',
            name: 'AirPods Pro 2',
            quantity: 1,
            price: 249.99,
            image: 'https://via.placeholder.com/100x100?text=AirPods'
          }
        ]
      }
    ]
  });
});

// Mock cart storage (in-memory for simplicity)
let mockCart = [];

// Mock cart endpoints
app.get('/api/cart', (req, res) => {
  console.log('🛒 Cart API: Get cart request');
  const totalAmount = mockCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  res.json({
    success: true,
    message: 'Cart retrieved successfully',
    items: mockCart,
    totalAmount: totalAmount
  });
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  // Find the product from our mock products
  const products = [
    {
      _id: '1',
      name: 'iPhone 15 Pro',
      price: 999.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro', alt: 'iPhone 15 Pro' }],
      stock: 50
    },
    {
      _id: '2',
      name: 'Samsung Galaxy S24',
      price: 899.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=Galaxy+S24', alt: 'Samsung Galaxy S24' }],
      stock: 30
    },
    {
      _id: '3',
      name: 'MacBook Pro M3',
      price: 1999.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=MacBook+Pro', alt: 'MacBook Pro M3' }],
      stock: 20
    },
    {
      _id: '4',
      name: 'AirPods Pro 2',
      price: 249.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=AirPods+Pro', alt: 'AirPods Pro 2' }],
      stock: 100
    },
    {
      _id: '5',
      name: 'iPad Air',
      price: 599.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=iPad+Air', alt: 'iPad Air' }],
      stock: 40
    },
    {
      _id: '6',
      name: 'Sony WH-1000XM5',
      price: 349.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=Sony+WH-1000XM5', alt: 'Sony WH-1000XM5' }],
      stock: 60
    },
    {
      _id: '7',
      name: 'Dell XPS 13',
      price: 1299.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=Dell+XPS+13', alt: 'Dell XPS 13' }],
      stock: 25
    },
    {
      _id: '8',
      name: 'PlayStation 5',
      price: 499.99,
      images: [{ url: 'https://via.placeholder.com/300x300?text=PlayStation+5', alt: 'PlayStation 5' }],
      stock: 15
    }
  ];

  const product = products.find(p => p._id === productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if item already exists in cart
  const existingItemIndex = mockCart.findIndex(item => item.product._id === productId);
  
  if (existingItemIndex !== -1) {
    // Update quantity
    mockCart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    mockCart.push({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock
      },
      quantity: quantity
    });
  }

  const totalAmount = mockCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  console.log('✅ Cart API: Item added to cart', { 
    totalItems: mockCart.length, 
    totalAmount: totalAmount 
  });

  res.json({
    success: true,
    message: 'Item added to cart successfully',
    items: mockCart,
    totalAmount: totalAmount
  });
});

app.put('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  
  if (!productId || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Product ID and valid quantity are required'
    });
  }

  const existingItemIndex = mockCart.findIndex(item => item.product._id === productId);
  
  if (existingItemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    mockCart.splice(existingItemIndex, 1);
  } else {
    // Update quantity
    mockCart[existingItemIndex].quantity = quantity;
  }

  const totalAmount = mockCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  res.json({
    success: true,
    message: 'Cart updated successfully',
    items: mockCart,
    totalAmount: totalAmount
  });
});

app.delete('/api/cart/remove/:productId', (req, res) => {
  const { productId } = req.params;
  
  const existingItemIndex = mockCart.findIndex(item => item.product._id === productId);
  
  if (existingItemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  mockCart.splice(existingItemIndex, 1);
  const totalAmount = mockCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  res.json({
    success: true,
    message: 'Item removed from cart successfully',
    items: mockCart,
    totalAmount: totalAmount
  });
});

app.delete('/api/cart/clear', (req, res) => {
  mockCart = [];
  
  res.json({
    success: true,
    message: 'Cart cleared successfully',
    items: [],
    totalAmount: 0
  });
});

// Real Razorpay Payment Endpoints (for Google Pay via Razorpay)
app.post('/api/payment-methods/razorpay/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay service not available - missing secret key. Please add RAZORPAY_KEY_SECRET to .env file'
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    console.log('🔄 Creating Razorpay order:', { amount, currency, receipt });

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        orderId: receipt || `order_${Date.now()}`
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order);

    res.json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      }
    });
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
});

// Google Pay via Razorpay
app.post('/api/payment-methods/googlepay/create', async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required'
      });
    }

    console.log('🔄 Creating Google Pay order via Razorpay:', { amount, currency, orderId });

    // Create Razorpay order for Google Pay
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: orderId,
      notes: {
        orderId: orderId,
        paymentMethod: 'googlepay'
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Google Pay order created via Razorpay:', order);

    // Google Pay configuration for Razorpay
    const googlePayData = {
      paymentData: {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'razorpay',
                gatewayMerchantId: process.env.RAZORPAY_KEY_ID
              }
            }
          }
        ],
        merchantInfo: {
          merchantId: process.env.RAZORPAY_KEY_ID,
          merchantName: 'NextTechFusionGadgets'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: (amount).toString(),
          currencyCode: currency,
          countryCode: currency === 'INR' ? 'IN' : 'US'
        }
      },
      razorpayOrderId: order.id,
      orderId: orderId,
      amount: amount,
      currency: currency
    };

    res.json({
      success: true,
      message: 'Google Pay payment data created successfully',
      data: googlePayData
    });
  } catch (error) {
    console.error('❌ Google Pay order creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Google Pay order',
      error: error.message
    });
  }
});

// Razorpay payment verification
app.post('/api/payment-methods/razorpay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    console.log('🔄 Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id });

    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      console.log('✅ Razorpay payment verified successfully');
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          status: 'success'
        }
      });
    } else {
      console.log('❌ Razorpay payment verification failed');
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('❌ Razorpay verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

app.post('/api/payment-methods/googlepay/process', (req, res) => {
  const { amount, currency, orderId, paymentToken, testMode } = req.body;
  
  if (!amount || !orderId || !paymentToken) {
    return res.status(400).json({
      success: false,
      message: 'Amount, order ID, and payment token are required'
    });
  }

  // Mock payment processing
  const transactionId = `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    success: true,
    data: {
      transactionId,
      status: 'completed',
      amount,
      currency,
      orderId,
      paymentMethod: 'googlepay',
      testMode: testMode || false,
      processedAt: new Date().toISOString()
    }
  });
});

app.get('/api/payment-methods', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: 'pm_1',
        provider: 'googlepay',
        nickname: 'Google Pay',
        type: 'digital_wallet',
        details: {
          walletProvider: 'Google Pay'
        },
        digitalWallet: {
          walletType: 'Google Pay',
          email: 'user@gmail.com'
        },
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'pm_2',
        provider: 'paypal',
        nickname: 'PayPal',
        type: 'digital_wallet',
        details: {
          walletProvider: 'PayPal'
        },
        digitalWallet: {
          walletType: 'PayPal',
          email: 'user@paypal.com'
        },
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'pm_3',
        provider: 'upi',
        nickname: 'UPI Payment',
        type: 'upi',
        details: {
          upiId: 'user@paytm'
        },
        upi: {
          vpa: 'user@paytm',
          name: 'Test User',
          verified: true
        },
        isDefault: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'pm_4',
        provider: 'stripe',
        nickname: 'Visa Card',
        type: 'card',
        details: {
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025
        },
        card: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025
        },
        billingAddress: {
          city: 'New York',
          state: 'NY',
          country: 'US',
          zipCode: '10001'
        },
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
});

// Mock categories endpoint
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', name: 'Smartphones', slug: 'smartphones', count: 25 },
      { id: '2', name: 'Laptops', slug: 'laptops', count: 15 },
      { id: '3', name: 'Tablets', slug: 'tablets', count: 10 },
      { id: '4', name: 'Audio', slug: 'audio', count: 20 },
      { id: '5', name: 'Accessories', slug: 'accessories', count: 30 }
    ]
  });
});

// UPI Payment Endpoints
app.post('/api/payment-methods/upi/create', (req, res) => {
  const { amount, currency = 'INR', orderId, upiId, paymentMode = 'upi' } = req.body;
  
  console.log('🔄 UPI Payment Create Request:', { amount, currency, orderId, upiId, paymentMode });
  
  // Generate UPI payment string
  const merchantUpiId = 'merchant@paytm'; // Your merchant UPI ID
  const upiString = `upi://pay?pa=${merchantUpiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`;
  
  res.json({
    success: true,
    message: 'UPI payment initiated',
    data: {
      paymentId: `upi_${Date.now()}`,
      orderId: orderId,
      amount: amount,
      currency: currency,
      upiId: upiId,
      merchantUpiId: merchantUpiId,
      paymentMode: paymentMode,
      upiString: upiString,
      qrCode: upiString,
      deepLinks: {
        googlepay: `tez://upi/pay?pa=${merchantUpiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`,
        phonepe: `phonepe://pay?pa=${merchantUpiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`,
        paytm: `paytmmp://pay?pa=${merchantUpiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`,
        generic: upiString
      },
      instructions: {
        upi: 'Enter your UPI ID and proceed with payment',
        qr: 'Scan the QR code with any UPI app to complete payment'
      },
      status: 'pending'
    }
  });
});

app.post('/api/payment-methods/upi/process', (req, res) => {
  const { paymentId, upiId, amount } = req.body;
  
  console.log('💳 UPI Payment Process Request:', { paymentId, upiId, amount });
  
  // Simulate payment processing
  setTimeout(() => {
    res.json({
      success: true,
      message: 'UPI payment processed successfully',
      data: {
        transactionId: `txn_upi_${Date.now()}`,
        paymentId: paymentId,
        status: 'success',
        amount: amount,
        upiId: upiId,
        timestamp: new Date().toISOString()
      }
    });
  }, 1000);
});

// PhonePe Payment Endpoints
app.post('/api/payment-methods/phonepe/create', (req, res) => {
  const { amount, currency = 'INR', orderId, upiId } = req.body;
  
  console.log('📱 PhonePe Payment Create Request:', { amount, currency, orderId, upiId });
  
  res.json({
    success: true,
    message: 'PhonePe payment initiated',
    data: {
      paymentId: `phonepe_${Date.now()}`,
      orderId: orderId,
      amount: amount,
      currency: currency,
      upiId: upiId,
      deepLink: `phonepe://pay?pa=${upiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`,
      qrCode: `upi://pay?pa=${upiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`,
      status: 'pending'
    }
  });
});

app.post('/api/payment-methods/phonepe/process', (req, res) => {
  const { paymentId, upiId, amount } = req.body;
  
  console.log('📱 PhonePe Payment Process Request:', { paymentId, upiId, amount });
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'PhonePe payment processed successfully',
      data: {
        transactionId: `txn_phonepe_${Date.now()}`,
        paymentId: paymentId,
        status: 'success',
        amount: amount,
        upiId: upiId,
        timestamp: new Date().toISOString()
      }
    });
  }, 1500);
});

// Paytm Payment Endpoints
app.post('/api/payment-methods/paytm/create', (req, res) => {
  const { amount, currency = 'INR', orderId, upiId } = req.body;
  
  console.log('💰 Paytm Payment Create Request:', { amount, currency, orderId, upiId });
  
  res.json({
    success: true,
    message: 'Paytm payment initiated',
    data: {
      paymentId: `paytm_${Date.now()}`,
      orderId: orderId,
      amount: amount,
      currency: currency,
      upiId: upiId,
      deepLink: `paytmmp://pay?pa=${upiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`,
      qrCode: `upi://pay?pa=${upiId}&pn=NextTechFusionGadgets&am=${amount}&cu=${currency}&tn=Payment for Order ${orderId}`,
      status: 'pending'
    }
  });
});

app.post('/api/payment-methods/paytm/process', (req, res) => {
  const { paymentId, upiId, amount } = req.body;
  
  console.log('💰 Paytm Payment Process Request:', { paymentId, upiId, amount });
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Paytm payment processed successfully',
      data: {
        transactionId: `txn_paytm_${Date.now()}`,
        paymentId: paymentId,
        status: 'success',
        amount: amount,
        upiId: upiId,
        timestamp: new Date().toISOString()
      }
    });
  }, 1200);
});

// Card Payment Endpoints (Stripe)
app.post('/api/payment-methods/card/create', (req, res) => {
  const { amount, currency = 'USD', orderId, cardNumber, expiryDate, cvv } = req.body;
  
  console.log('💳 Card Payment Create Request:', { amount, currency, orderId, cardNumber: cardNumber?.slice(-4) });
  
  res.json({
    success: true,
    message: 'Card payment initiated',
    data: {
      paymentId: `card_${Date.now()}`,
      orderId: orderId,
      amount: amount,
      currency: currency,
      cardLast4: cardNumber?.slice(-4),
      status: 'pending'
    }
  });
});

app.post('/api/payment-methods/card/process', (req, res) => {
  const { paymentId, cardNumber, expiryDate, cvv, amount } = req.body;
  
  console.log('💳 Card Payment Process Request:', { paymentId, cardLast4: cardNumber?.slice(-4), amount });
  
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Card payment processed successfully',
      data: {
        transactionId: `txn_card_${Date.now()}`,
        paymentId: paymentId,
        status: 'success',
        amount: amount,
        cardLast4: cardNumber?.slice(-4),
        timestamp: new Date().toISOString()
      }
    });
  }, 2000);
});

// Real PayPal Payment Endpoints
app.post('/api/payment-methods/paypal/create-order', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({
        success: false,
        message: 'PayPal service not available - missing secret key. Please add PAYPAL_CLIENT_SECRET to .env file'
      });
    }

    const { amount, currency = 'USD', items = [], returnUrl, cancelUrl, orderId } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    console.log('🌐 Creating PayPal order:', { amount, currency, items, orderId });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: orderId || `ORDER_${Date.now()}`,
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        description: 'NextTechFusionGadgets Purchase'
      }],
      application_context: {
        return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
        brand_name: 'NextTechFusionGadgets',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW'
      }
    });

    const order = await paypalClient.execute(request);
    console.log('✅ PayPal order created:', order.result);

    const approvalUrl = order.result.links.find(link => link.rel === 'approve')?.href;

    res.json({
      success: true,
      message: 'PayPal order created successfully',
      data: {
        orderId: order.result.id,
        status: order.result.status,
        amount: amount,
        currency: currency,
        links: order.result.links,
        approvalUrl: approvalUrl
      }
    });
  } catch (error) {
    console.error('❌ PayPal order creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order',
      error: error.message
    });
  }
});

app.post('/api/payment-methods/paypal/capture/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('🌐 Capturing PayPal order:', orderId);

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    console.log('✅ PayPal payment captured:', capture.result);

    res.json({
      success: true,
      message: 'PayPal payment captured successfully',
      data: {
        orderId: capture.result.id,
        status: capture.result.status,
        paymentId: capture.result.purchase_units[0]?.payments?.captures[0]?.id,
        amount: capture.result.purchase_units[0]?.payments?.captures[0]?.amount,
        customId: capture.result.purchase_units[0]?.custom_id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ PayPal capture failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment',
      error: error.message
    });
  }
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NextTechFusionGadgets API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`⚡ Simple server mode - no database required`);
});

module.exports = app;