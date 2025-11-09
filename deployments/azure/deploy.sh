#!/bin/bash

# Azure Container Apps Deployment Script for NextTechFusionGadgets
# Replace SUBSCRIPTION_ID, RESOURCE_GROUP, REGISTRY_NAME, LOCATION with your values

set -e

SUBSCRIPTION_ID="your-subscription-id"
RESOURCE_GROUP="nexttechfusion-rg"
LOCATION="eastus"
REGISTRY_NAME="nexttechfusionregistry"
APP_NAME="nexttechfusion-backend"
ENV_NAME="nexttechfusion-env"

echo "🚀 Starting Azure Container Apps deployment..."

# Login to Azure
echo "🔐 Logging into Azure..."
az login --use-device-code

# Set subscription
az account set --subscription $SUBSCRIPTION_ID

# Create resource group if it doesn't exist
echo "📁 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry
echo "🏗️ Creating container registry..."
az acr create --resource-group $RESOURCE_GROUP --name $REGISTRY_NAME --sku Basic

# Build and push Docker image
echo "📦 Building and pushing Docker image..."
az acr login --name $REGISTRY_NAME
docker build -t $REGISTRY_NAME.azurecr.io/$APP_NAME:latest ./backend
docker push $REGISTRY_NAME.azurecr.io/$APP_NAME:latest

# Create managed environment
echo "🌐 Creating container apps environment..."
az containerapp env create \
  --name $ENV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Create secrets (you'll need to set these values)
echo "🔐 Creating secrets..."
az containerapp secret set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --secrets mongodb-uri=YOUR_MONGODB_URI jwt-secret=YOUR_JWT_SECRET redis-url=YOUR_REDIS_URL stripe-secret=YOUR_STRIPE_SECRET

# Deploy container app
echo "🚀 Deploying container app..."
az containerapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $REGISTRY_NAME.azurecr.io/$APP_NAME:latest \
  --target-port 5000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 10 \
  --cpu 0.5 \
  --memory 1Gi \
  --env-vars NODE_ENV=production PORT=5000 \
  --secrets mongodb-uri=mongodb-uri jwt-secret=jwt-secret redis-url=redis-url stripe-secret=stripe-secret

echo "✅ Deployment completed successfully!"
echo "🌐 App URL: $(az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)"