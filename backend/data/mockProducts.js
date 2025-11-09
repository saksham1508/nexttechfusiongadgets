// Mock products for development without MongoDB
const mockProducts = [
  {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    name: 'iPhone 15 Pro Max',
    price: 1199.99,
    originalPrice: 1299.99,
    images: [
      { url: '/images/iphone-15-pro-max.jpg', alt: 'iPhone 15 Pro Max' }
    ],
    stock: 25,
    category: 'Smartphones',
    brand: 'Apple',
    rating: 4.8,
    numReviews: 156,
    description: 'The most advanced iPhone ever with titanium design and A17 Pro chip.'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    id: '507f1f77bcf86cd799439012',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1099.99,
    originalPrice: 1199.99,
    images: [
      { url: '/images/galaxy-s24-ultra.jpg', alt: 'Samsung Galaxy S24 Ultra' }
    ],
    stock: 18,
    category: 'Smartphones',
    brand: 'Samsung',
    rating: 4.7,
    numReviews: 203,
    description: 'Ultimate productivity powerhouse with S Pen and AI features.'
  },
  {
    _id: '507f1f77bcf86cd799439013',
    id: '507f1f77bcf86cd799439013',
    name: 'MacBook Pro 16" M3',
    price: 2499.99,
    originalPrice: 2699.99,
    images: [
      { url: '/images/macbook-pro-16-m3.jpg', alt: 'MacBook Pro 16 M3' }
    ],
    stock: 12,
    category: 'Laptops',
    brand: 'Apple',
    rating: 4.9,
    numReviews: 89,
    description: 'Professional laptop with M3 chip for ultimate performance.'
  },
  {
    _id: '507f1f77bcf86cd799439014',
    id: '507f1f77bcf86cd799439014',
    name: 'Sony WH-1000XM5',
    price: 399.99,
    originalPrice: 449.99,
    images: [
      { url: '/images/sony-wh1000xm5.jpg', alt: 'Sony WH-1000XM5' }
    ],
    stock: 35,
    category: 'Audio',
    brand: 'Sony',
    rating: 4.6,
    numReviews: 312,
    description: 'Industry-leading noise canceling headphones with premium sound.'
  },
  {
    _id: '507f1f77bcf86cd799439015',
    id: '507f1f77bcf86cd799439015',
    name: 'Apple Watch Series 9',
    price: 429.99,
    originalPrice: 479.99,
    images: [
      { url: '/images/apple-watch-series-9.jpg', alt: 'Apple Watch Series 9' }
    ],
    stock: 28,
    category: 'Wearables',
    brand: 'Apple',
    rating: 4.5,
    numReviews: 178,
    description: 'Advanced smartwatch with health monitoring and fitness tracking.'
  }
];

module.exports = mockProducts;
