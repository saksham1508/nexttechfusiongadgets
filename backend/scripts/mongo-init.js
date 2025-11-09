// MongoDB Initialization Script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('nexttechfusiongadgets');

// Create application user with read/write permissions
db.createUser({
  user: 'appuser',
  pwd: 'apppassword123',
  roles: [
    {
      role: 'readWrite',
      db: 'nexttechfusiongadgets'
    }
  ]
});

// Create initial collections with indexes for better performance
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('categories');

// Create indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ name: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ seller: 1 });
db.products.createIndex({ createdAt: -1 });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ createdAt: -1 });

print('✅ Database initialization completed successfully!');
print('📊 Collections created: users, products, orders, categories');
print('🔍 Indexes created for optimal performance');
print('👤 Application user created: appuser');
