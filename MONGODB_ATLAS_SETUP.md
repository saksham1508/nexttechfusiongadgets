# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" 
3. Sign up with your email
4. Choose "Build a database" → "M0 FREE"

### Step 2: Configure Database
1. **Cloud Provider**: AWS (default)
2. **Region**: Choose closest to your location
3. **Cluster Name**: nexttechfusion-cluster
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. **Username**: `appuser`
4. **Password**: `apppassword123` (or generate secure password)
5. **Database User Privileges**: Read and write to any database
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. Copy the connection string (looks like):
   ```
   mongodb+srv://appuser:<password>@nexttechfusion-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env File
Replace the MONGO_URI in your .env file with the Atlas connection string:
```env
MONGO_URI=mongodb+srv://appuser:apppassword123@nexttechfusion-cluster.xxxxx.mongodb.net/nexttechfusiongadgets?retryWrites=true&w=majority
```

**Note**: Replace `<password>` with your actual password and add `/nexttechfusiongadgets` before the `?` to specify your database name.

## Benefits of MongoDB Atlas
✅ **No local installation required**
✅ **Always available (cloud-hosted)**
✅ **Free tier with 512MB storage**
✅ **Automatic backups**
✅ **Built-in security**
✅ **Easy to scale**

## Test Connection
After updating your .env file, test the connection:
```bash
npm run test:db
```