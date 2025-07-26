# Database Setup Script for NextTechFusionGadgets
Write-Host "🗄️ Setting up MongoDB for NextTechFusionGadgets..." -ForegroundColor Green

# Check if MongoDB is installed
try {
    $mongoVersion = mongod --version
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB is not installed. Installing MongoDB..." -ForegroundColor Red
    Write-Host "Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "Or use MongoDB Atlas cloud service" -ForegroundColor Yellow
    exit 1
}

# Create database initialization script
Write-Host "📝 Creating database initialization script..." -ForegroundColor Yellow

@"
// MongoDB Initialization Script for NextTechFusionGadgets
use nexttechfusiongadgets;

// Create collections with validation
db.createCollection('users', {
  validator: {
    `$jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' },
        role: { enum: ['user', 'admin', 'moderator'] }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    `$jsonSchema: {
      bsonType: 'object',
      required: ['name', 'price', 'category'],
      properties: {
        name: { bsonType: 'string' },
        price: { bsonType: 'number', minimum: 0 },
        category: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    `$jsonSchema: {
      bsonType: 'object',
      required: ['user', 'items', 'totalAmount'],
      properties: {
        totalAmount: { bsonType: 'number', minimum: 0 },
        status: { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ name: 'text', description: 'text' });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.paymentmethods.createIndex({ user: 1 });
db.paymentmethods.createIndex({ user: 1, isDefault: 1 });
db.paymentmethods.createIndex({ provider: 1 });
db.paymentmethods.createIndex({ riskScore: 1 });

// Insert sample data for testing
db.users.insertOne({
  name: 'Admin User',
  email: 'admin@nexttechfusiongadgets.com',
  password: '`$2a`$10`$hashedpassword',
  role: 'admin',
  isActive: true,
  createdAt: new Date()
});

print('✅ Database initialized successfully!');
"@ | Out-File -FilePath "init-db.js" -Encoding UTF8

Write-Host "✅ Database initialization script created: init-db.js" -ForegroundColor Green
Write-Host "Run: mongo < init-db.js" -ForegroundColor Yellow