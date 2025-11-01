# Vercel Deployment Guide for NextTechFusionGadgets

This guide explains how to deploy the NextTechFusionGadgets e-commerce application to Vercel. Since this is a full-stack application with a Node.js backend, the deployment strategy involves:

- **Frontend**: Deployed to Vercel (Create React App)
- **Backend**: Deployed separately to a platform that supports Node.js servers (Heroku, Railway, DigitalOcean, etc.)

## Prerequisites

- Vercel account
- Backend deployment platform account (Heroku/Railway/DigitalOcean)
- Domain name (optional but recommended for production)

## Step 1: Deploy Backend Separately

The backend cannot be deployed to Vercel as it requires persistent server processes. Choose one of these options:

### Option A: Deploy to Railway (Recommended)

1. Go to [Railway.app](https://railway.app) and create an account
2. Connect your GitHub repository
3. Railway will auto-detect the Node.js app
4. Set environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   REDIS_URL=your_redis_url
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=30d
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   # Add other payment and service keys
   ```
5. Deploy and note the generated URL (e.g., `https://nexttechfusion-backend.up.railway.app`)

### Option B: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create nexttechfusion-backend`
4. Set environment variables: `heroku config:set KEY=VALUE`
5. Deploy: `git push heroku main`
6. Note the Heroku URL (e.g., `https://nexttechfusion-backend.herokuapp.com`)

## Step 2: Prepare Frontend for Vercel Deployment

The frontend has been configured for Vercel deployment with:

- `vercel.json` configuration file
- Environment variable template (`.env.vercel`)
- Centralized API configuration

## Step 3: Deploy Frontend to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

5. Follow the prompts to configure your project

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

## Step 4: Configure Environment Variables in Vercel

In your Vercel project dashboard, go to Settings → Environment Variables and add:

### Required Variables:
```
REACT_APP_ENV=production
NODE_ENV=production
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

### Optional Variables (replace with your actual keys):
```
# Social Authentication
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_GOOGLE_OAUTH_REDIRECT_URI=https://your-vercel-domain.vercel.app/auth/google/callback

# Firebase
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id

# Payment Keys (Live/Production)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id
REACT_APP_GOOGLE_PAY_ENVIRONMENT=PRODUCTION

# Analytics
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_FB_PIXEL_ID=your_pixel_id

# Production Settings
REACT_APP_ENABLE_REDUX_DEVTOOLS=false
REACT_APP_ENABLE_CONSOLE_LOGS=false
REACT_APP_MOCK_PAYMENTS=false
```

## Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with the custom domain:
   ```
   REACT_APP_GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   ```

## Step 6: Update Backend CORS Settings

Ensure your backend allows requests from your Vercel domain:

In your backend `.env.production` or environment variables:
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

## Step 7: Test the Deployment

1. Visit your Vercel domain
2. Test user registration/login
3. Test product browsing and cart functionality
4. Test payment flows
5. Check browser console for any API errors

## Troubleshooting

### Common Issues:

1. **API Connection Failed**
   - Check `REACT_APP_API_URL` is correctly set
   - Ensure backend CORS allows your Vercel domain
   - Verify backend is running and accessible

2. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript types are correct
   - Check for any missing environment variables during build

3. **Environment Variables Not Working**
   - Vercel environment variables are case-sensitive
   - Restart deployment after changing variables
   - Check variable names match exactly (including `REACT_APP_` prefix)

4. **Socket Connection Issues**
   - Ensure `REACT_APP_SOCKET_URL` points to your backend
   - Check backend WebSocket configuration

### Useful Commands:

```bash
# Check Vercel deployment logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

## Security Considerations

1. **Never commit secrets** to version control
2. **Use HTTPS** (Vercel provides this automatically)
3. **Configure CORS** properly on backend
4. **Use secure cookies** for authentication
5. **Regularly rotate** API keys and secrets

## Performance Optimization

Vercel automatically provides:
- Global CDN
- Automatic HTTPS
- Image optimization
- Automatic deployments on git push

Additional optimizations:
- Enable Vercel Analytics for monitoring
- Set up proper caching headers
- Use Vercel's Edge Functions if needed for API routes

## Cost Considerations

- **Vercel**: Free tier includes generous limits, paid plans start at $20/month
- **Backend**: Costs vary by provider (Railway/Heroku/DigitalOcean)
- **Database**: MongoDB Atlas has a free tier
- **Redis**: Various cloud providers offer free tiers

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check backend logs
3. Verify environment variables
4. Test API endpoints directly
5. Check browser network tab for failed requests

For more help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- Your backend platform's documentation