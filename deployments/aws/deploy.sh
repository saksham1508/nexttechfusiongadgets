#!/bin/bash

# AWS ECS Deployment Script for NextTechFusionGadgets
# Replace ACCOUNT_ID, REGION, CLUSTER_NAME, SERVICE_NAME with your values

set -e

ACCOUNT_ID="YOUR_AWS_ACCOUNT_ID"
REGION="us-east-1"
CLUSTER_NAME="nexttechfusion-cluster"
SERVICE_NAME="nexttechfusion-backend-service"
REPOSITORY_NAME="nexttechfusion-backend"

echo "🚀 Starting AWS ECS deployment..."

# Build and push Docker image
echo "📦 Building and pushing Docker image..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker build -t $REPOSITORY_NAME:latest ./backend
docker tag $REPOSITORY_NAME:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPOSITORY_NAME:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPOSITORY_NAME:latest

# Register new task definition
echo "📋 Registering new task definition..."
TASK_DEFINITION=$(aws ecs register-task-definition --cli-input-json file://task-definition.json --region $REGION)

# Update service with new task definition
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $REPOSITORY_NAME \
  --region $REGION \
  --force-new-deployment

echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION

echo "✅ Deployment completed successfully!"