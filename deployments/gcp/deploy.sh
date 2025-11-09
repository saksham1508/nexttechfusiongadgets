#!/bin/bash

# Google Cloud Run Deployment Script for NextTechFusionGadgets
# Replace PROJECT_ID, REGION with your values

set -e

PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="nexttechfusion-backend"

echo "🚀 Starting Google Cloud Run deployment..."

# Build and push Docker image
echo "📦 Building and pushing Docker image..."
gcloud builds submit ./backend --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:latest --project $PROJECT_ID

# Create secrets if they don't exist
echo "🔐 Ensuring secrets exist..."
gcloud secrets describe mongodb-uri --project $PROJECT_ID >/dev/null 2>&1 || \
  echo "Please create secrets using: gcloud secrets create mongodb-uri --data-file=-"

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 5000 \
  --cpu 1 \
  --memory 1Gi \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production \
  --set-secrets MONGODB_URI=mongodb-uri:latest \
  --set-secrets JWT_SECRET=jwt-secret:latest \
  --set-secrets REDIS_URL=redis-url:latest \
  --set-secrets STRIPE_SECRET_KEY=stripe-secret:latest \
  --project $PROJECT_ID

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')"