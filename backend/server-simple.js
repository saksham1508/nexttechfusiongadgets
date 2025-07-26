const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        price: 999.99,
        description: 'Latest iPhone with advanced features',
        category: 'Smartphones',
        brand: 'Apple',
        countInStock: 50,
        images: ['https://via.placeholder.com/300x300?text=iPhone+15+Pro'],
        rating: 4.8,
        numReviews: 125
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24',
        price: 899.99,
        description: 'Flagship Android smartphone',
        category: 'Smartphones',
        brand: 'Samsung',
        countInStock: 30,
        images: ['https://via.placeholder.com/300x300?text=Galaxy+S24'],
        rating: 4.7,
        numReviews: 98
      },
      {
        id: '3',
        name: 'MacBook Pro M3',
        price: 1999.99,
        description: 'Professional laptop with M3 chip',
        category: 'Laptops',
        brand: 'Apple',
        countInStock: 20,
        images: ['https://via.placeholder.com/300x300?text=MacBook+Pro'],
        rating: 4.9,
        numReviews: 87
      },
      {
        id: '4',
        name: 'AirPods Pro 2',
        price: 249.99,
        description: 'Wireless earbuds with noise cancellation',
        category: 'Audio',
        brand: 'Apple',
        countInStock: 100,
        images: ['https://via.placeholder.com/300x300?text=AirPods+Pro'],
        rating: 4.6,
        numReviews: 156
      },
      {
        id: '5',
        name: 'iPad Air',
        price: 599.99,
        description: 'Versatile tablet for work and play',
        category: 'Tablets',
        brand: 'Apple',
        countInStock: 40,
        images: ['https://via.placeholder.com/300x300?text=iPad+Air'],
        rating: 4.5,
        numReviews: 73
      }
    ],
    pagination: {
      page: 1,
      pages: 1,
      total: 5
    }
  });
});

// Mock product by ID endpoint
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  const products = {
    '1': {
      id: '1',
      name: 'iPhone 15 Pro',
      price: 999.99,
      description: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and advanced camera system.',
      category: 'Smartphones',
      brand: 'Apple',
      countInStock: 50,
      images: [
        'https://via.placeholder.com/600x600?text=iPhone+15+Pro+Front',
        'https://via.placeholder.com/600x600?text=iPhone+15+Pro+Back'
      ],
      rating: 4.8,
      numReviews: 125,
      specifications: {
        'Display': '6.1-inch Super Retina XDR',
        'Chip': 'A17 Pro',
        'Storage': '128GB, 256GB, 512GB, 1TB',
        'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
        'Battery': 'Up to 23 hours video playback'
      },
      reviews: [
        {
          id: '1',
          user: 'John Doe',
          rating: 5,
          comment: 'Amazing phone with great camera quality!',
          date: '2024-01-15'
        },
        {
          id: '2',
          user: 'Jane Smith',
          rating: 4,
          comment: 'Good performance but expensive.',
          date: '2024-01-10'
        }
      ]
    },
    '2': {
      id: '2',
      name: 'Samsung Galaxy S24',
      price: 899.99,
      description: 'Samsung Galaxy S24 with AI-powered features and exceptional display.',
      category: 'Smartphones',
      brand: 'Samsung',
      countInStock: 30,
      images: [
        'https://via.placeholder.com/600x600?text=Galaxy+S24+Front',
        'https://via.placeholder.com/600x600?text=Galaxy+S24+Back'
      ],
      rating: 4.7,
      numReviews: 98,
      specifications: {
        'Display': '6.2-inch Dynamic AMOLED 2X',
        'Processor': 'Snapdragon 8 Gen 3',
        'Storage': '128GB, 256GB',
        'Camera': '50MP Main, 12MP Ultra Wide, 10MP Telephoto',
        'Battery': '4000mAh'
      }
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

// Mock cart endpoints
app.get('/api/cart', (req, res) => {
  res.json({
    success: true,
    data: {
      items: [
        {
          id: '1',
          product: {
            id: '1',
            name: 'iPhone 15 Pro',
            price: 999.99,
            image: 'https://via.placeholder.com/100x100?text=iPhone'
          },
          quantity: 1
        }
      ],
      total: 999.99
    }
  });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  
  res.json({
    success: true,
    message: 'Item added to cart',
    data: {
      productId,
      quantity
    }
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