#!/bin/bash

# Unified Cloud Deployment Script for NextTechFusionGadgets
# This script automatically detects the cloud platform and deploys accordingly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load cloud detection script
source ./scripts/detect-cloud.sh

echo -e "${BLUE}🚀 Starting unified cloud deployment...${NC}"
echo -e "${BLUE}☁️  Target platform: $CLOUD_PLATFORM${NC}"

# Function to deploy to AWS
deploy_aws() {
    echo -e "${YELLOW}📦 Deploying to AWS ECS...${NC}"

    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure' first.${NC}"
        exit 1
    fi

    # Set AWS variables
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=${AWS_REGION:-us-east-1}
    CLUSTER_NAME=${ECS_CLUSTER_NAME:-nexttechfusion-cluster}
    SERVICE_NAME=${ECS_SERVICE_NAME:-nexttechfusion-backend-service}
    REPOSITORY_NAME=${ECR_REPOSITORY_NAME:-nexttechfusion-backend}

    echo "Account ID: $ACCOUNT_ID"
    echo "Region: $REGION"
    echo "Cluster: $CLUSTER_NAME"
    echo "Service: $SERVICE_NAME"

    # Build and push Docker image
    echo -e "${BLUE}🐳 Building and pushing Docker image...${NC}"
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

    # Build backend image
    docker build -t $REPOSITORY_NAME:latest ./backend
    docker tag $REPOSITORY_NAME:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPOSITORY_NAME:latest
    docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPOSITORY_NAME:latest

    # Update task definition with new image
    sed -i "s|ACCOUNT_ID|$ACCOUNT_ID|g" deployments/aws/task-definition.json
    sed -i "s|REGION|$REGION|g" deployments/aws/task-definition.json

    # Register new task definition
    echo -e "${BLUE}📋 Registering new task definition...${NC}"
    aws ecs register-task-definition --cli-input-json file://deployments/aws/task-definition.json --region $REGION

    # Update service
    echo -e "${BLUE}🔄 Updating ECS service...${NC}"
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --task-definition $REPOSITORY_NAME \
        --region $REGION \
        --force-new-deployment

    # Wait for deployment to complete
    echo -e "${BLUE}⏳ Waiting for deployment to complete...${NC}"
    aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION

    echo -e "${GREEN}✅ AWS deployment completed successfully!${NC}"
}

# Function to deploy to GCP
deploy_gcp() {
    echo -e "${YELLOW}📦 Deploying to Google Cloud Run...${NC}"

    # Check if gcloud is configured
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" >/dev/null 2>&1; then
        echo -e "${RED}❌ gcloud not configured. Please run 'gcloud auth login' first.${NC}"
        exit 1
    fi

    PROJECT_ID=$(gcloud config get-value project)
    REGION=${GCP_REGION:-us-central1}
    SERVICE_NAME=${CLOUD_RUN_SERVICE_NAME:-nexttechfusion-backend}

    echo "Project ID: $PROJECT_ID"
    echo "Region: $REGION"
    echo "Service: $SERVICE_NAME"

    # Build and push Docker image
    echo -e "${BLUE}🐳 Building and pushing Docker image...${NC}"
    gcloud builds submit ./backend --tag gcr.io/$PROJECT_ID/$SERVICE_NAME:latest --region $REGION

    # Deploy to Cloud Run
    echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 5000 \
        --memory 1Gi \
        --cpu 1 \
        --max-instances 10 \
        --concurrency 80 \
        --timeout 300

    echo -e "${GREEN}✅ GCP deployment completed successfully!${NC}"
}

# Function to deploy to Azure
deploy_azure() {
    echo -e "${YELLOW}📦 Deploying to Azure Container Apps...${NC}"

    # Check if Azure CLI is configured
    if ! az account show >/dev/null 2>&1; then
        echo -e "${RED}❌ Azure CLI not logged in. Please run 'az login' first.${NC}"
        exit 1
    fi

    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    RESOURCE_GROUP=${AZURE_RESOURCE_GROUP:-nexttechfusion-rg}
    LOCATION=${AZURE_LOCATION:-eastus}
    CONTAINER_APP_NAME=${AZURE_CONTAINER_APP_NAME:-nexttechfusion-backend}
    REGISTRY_NAME=${AZURE_REGISTRY_NAME:-nexttechfusionacr}

    echo "Subscription ID: $SUBSCRIPTION_ID"
    echo "Resource Group: $RESOURCE_GROUP"
    echo "Location: $LOCATION"
    echo "Container App: $CONTAINER_APP_NAME"

    # Build and push Docker image
    echo -e "${BLUE}🐳 Building and pushing Docker image...${NC}"
    az acr login --name $REGISTRY_NAME

    docker build -t $REGISTRY_NAME.azurecr.io/$CONTAINER_APP_NAME:latest ./backend
    docker push $REGISTRY_NAME.azurecr.io/$CONTAINER_APP_NAME:latest

    # Update container app YAML with actual values
    sed -i "s|SUBSCRIPTION_ID|$SUBSCRIPTION_ID|g" deployments/azure/container-app.yaml
    sed -i "s|RESOURCE_GROUP|$RESOURCE_GROUP|g" deployments/azure/container-app.yaml
    sed -i "s|LOCATION|$LOCATION|g" deployments/azure/container-app.yaml
    sed -i "s|CONTAINER_APP_NAME|$CONTAINER_APP_NAME|g" deployments/azure/container-app.yaml
    sed -i "s|REGISTRY_NAME|$REGISTRY_NAME|g" deployments/azure/container-app.yaml

    # Deploy container app
    echo -e "${BLUE}🚀 Deploying container app...${NC}"
    az containerapp create --resource-group $RESOURCE_GROUP --name $CONTAINER_APP_NAME --yaml deployments/azure/container-app.yaml

    echo -e "${GREEN}✅ Azure deployment completed successfully!${NC}"
}

# Function to deploy locally with Docker Compose
deploy_local() {
    echo -e "${YELLOW}🏠 Deploying locally with Docker Compose...${NC}"

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi

    echo -e "${BLUE}🐳 Starting services with Docker Compose...${NC}"
    docker-compose up -d --build

    echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
    sleep 30

    # Check health
    if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi

    if curl -f http://localhost:80/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
    fi

    echo -e "${GREEN}✅ Local deployment completed successfully!${NC}"
    echo -e "${BLUE}🌐 Frontend: http://localhost:80${NC}"
    echo -e "${BLUE}🔌 Backend API: http://localhost:5000${NC}"
}

# Main deployment logic
case $CLOUD_PLATFORM in
    "aws")
        deploy_aws
        ;;
    "gcp")
        deploy_gcp
        ;;
    "azure")
        deploy_azure
        ;;
    "railway")
        echo -e "${YELLOW}🚂 Railway deployment detected${NC}"
        echo -e "${BLUE}Railway handles deployment automatically via git push${NC}"
        echo -e "${GREEN}✅ No manual deployment needed${NC}"
        ;;
    "vercel")
        echo -e "${YELLOW}▲ Vercel deployment detected${NC}"
        echo -e "${BLUE}Vercel handles deployment automatically via git push${NC}"
        echo -e "${GREEN}✅ No manual deployment needed${NC}"
        ;;
    "local")
        deploy_local
        ;;
    *)
        echo -e "${RED}❌ Unknown cloud platform: $CLOUD_PLATFORM${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment process completed!${NC}"