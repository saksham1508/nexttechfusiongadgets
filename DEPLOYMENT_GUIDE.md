# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### ✅ **Code Quality**
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No hardcoded secrets or API keys
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Performance optimized

### ✅ **Security**
- [ ] Security audit completed
- [ ] Vulnerabilities fixed
- [ ] HTTPS configured
- [ ] Security headers implemented
- [ ] Rate limiting enabled
- [ ] Input validation in place

### ✅ **Configuration**
- [ ] Production environment variables set
- [ ] Database optimized for production
- [ ] Caching configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented

## Deployment Options

### **Option 1: Cloud Platform (Recommended)**

#### **Vercel (Frontend) + Railway/Render (Backend)**

##### **Frontend Deployment (Vercel)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Configure environment variables in Vercel dashboard
```

##### **Backend Deployment (Railway)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### **AWS Deployment**

##### **Frontend (S3 + CloudFront)**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync build/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

##### **Backend (EC2 + RDS)**
```bash
# Create EC2 instance
# Install Node.js, PM2, Nginx
# Set up MongoDB or use RDS
# Configure reverse proxy
```

### **Option 2: VPS Deployment**

#### **DigitalOcean/Linode Setup**

```bash
# 1. Create droplet with Ubuntu 20.04+
# 2. Initial server setup
sudo apt update && sudo apt upgrade -y
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2
sudo npm install -g pm2

# 5. Install Nginx
sudo apt install nginx

# 6. Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 7. Install Redis
sudo apt install redis-server

# 8. Clone and setup application
git clone https://github.com/yourusername/nexttechfusiongadgets.git
cd nexttechfusiongadgets
```

#### **Application Setup**
```bash
# Backend setup
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values

# Frontend setup
cd ../frontend
npm install
npm run build

# Start services
cd ../backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Option 3: Docker Deployment**

#### **Docker Compose Production**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:latest
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend

volumes:
  mongo_data:
  redis_data:
```

## Environment Configuration

### **Production Environment Variables**

#### **Backend (.env.production)**
```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/nexttechfusiongadgets?authSource=admin

# Security
JWT_SECRET=your-super-secure-jwt-secret-64-characters-long
ENCRYPTION_KEY=your-32-character-encryption-key

# Payment Gateways (PRODUCTION KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=app_password

# Monitoring
LOG_LEVEL=info
ENABLE_MONITORING=true

# SSL
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem
```

#### **Frontend (.env.production)**
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com

# Payment Keys (PUBLIC KEYS ONLY)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_RAZORPAY_KEY_ID=rzp_live_...
REACT_APP_PAYPAL_CLIENT_ID=...

# App Config
REACT_APP_NAME=NextTechFusionGadgets
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2.0.0

# Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=G-...
```

## SSL Certificate Setup

### **Let's Encrypt (Free SSL)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/nexttechfusiongadgets
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/nexttechfusiongadgets/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Optimization

### **MongoDB Production Setup**
```javascript
// Create production indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ category: 1, price: 1 });
db.orders.createIndex({ user: 1, createdAt: -1 });
db.paymentmethods.createIndex({ user: 1, isDefault: 1 });

// Enable authentication
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
});

// Configure replica set for high availability
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
});
```

## Monitoring Setup

### **PM2 Ecosystem Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nexttechfusion-api',
    script: 'server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

### **Log Rotation**
```bash
# /etc/logrotate.d/nexttechfusiongadgets
/var/www/nexttechfusiongadgets/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Backup Strategy

### **Database Backup**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="nexttechfusiongadgets"

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/$DATE.tar.gz s3://your-backup-bucket/
```

### **Automated Backups**
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

## Performance Optimization

### **Frontend Optimization**
```bash
# Build with optimizations
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### **Backend Optimization**
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Enable caching
const redis = require('redis');
const client = redis.createClient();

// Database connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## Health Checks & Monitoring

### **Health Check Endpoint**
```javascript
// backend/routes/health.js
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'OK',
      redis: 'OK',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  try {
    // Check database
    await mongoose.connection.db.admin().ping();
    
    // Check Redis
    await redisClient.ping();
    
    res.status(200).json(health);
  } catch (error) {
    health.message = 'ERROR';
    health.checks.database = error.message;
    res.status(503).json(health);
  }
});
```

### **Uptime Monitoring**
```bash
# Simple uptime check script
#!/bin/bash
URL="https://yourdomain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Service is UP"
else
    echo "$(date): Service is DOWN (HTTP $RESPONSE)"
    # Send alert (email, Slack, etc.)
fi
```

## Rollback Strategy

### **Quick Rollback**
```bash
# Using PM2
pm2 stop all
git checkout previous-stable-tag
npm install --production
pm2 start ecosystem.config.js

# Using Docker
docker-compose down
docker-compose -f docker-compose.prod.yml up -d --build
```

## Post-Deployment Checklist

- [ ] All services running
- [ ] SSL certificate valid
- [ ] Database accessible
- [ ] Payment gateways working
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Performance acceptable
- [ ] Security headers present
- [ ] Error tracking working
- [ ] Logs being generated

## Maintenance Tasks

### **Daily**
- [ ] Check application logs
- [ ] Monitor system resources
- [ ] Verify backup completion

### **Weekly**
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Performance analysis

### **Monthly**
- [ ] Security audit
- [ ] Database optimization
- [ ] SSL certificate check
- [ ] Disaster recovery test

---

## Support & Troubleshooting

### **Common Issues**

1. **502 Bad Gateway**
   - Check if backend service is running
   - Verify Nginx configuration
   - Check firewall settings

2. **Database Connection Issues**
   - Verify MongoDB is running
   - Check connection string
   - Ensure network access

3. **SSL Certificate Issues**
   - Renew certificate: `sudo certbot renew`
   - Check certificate validity
   - Verify Nginx SSL configuration

### **Emergency Contacts**
- System Administrator: admin@yourdomain.com
- Development Team: dev@yourdomain.com
- Hosting Provider Support: [Provider Support]

---

**🎉 Congratulations! Your NextTechFusionGadgets platform is now production-ready!**