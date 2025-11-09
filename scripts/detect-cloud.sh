#!/bin/bash

# Cloud Platform Detection and Configuration Script
# This script detects the cloud platform and sets appropriate environment variables

set -e

echo "🔍 Detecting cloud platform..."

# Function to check if running on AWS
detect_aws() {
    if [ -n "$AWS_REGION" ] || [ -f /sys/hypervisor/uuid ] && grep -q ec2 /sys/hypervisor/uuid 2>/dev/null; then
        echo "aws"
        return 0
    fi
    return 1
}

# Function to check if running on GCP
detect_gcp() {
    if [ -n "$GOOGLE_CLOUD_PROJECT" ] || curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/hostname >/dev/null 2>&1; then
        echo "gcp"
        return 0
    fi
    return 1
}

# Function to check if running on Azure
detect_azure() {
    if [ -n "$WEBSITE_SITE_NAME" ] || curl -s -H "Metadata: true" "http://169.254.169.254/metadata/instance?api-version=2021-02-01" >/dev/null 2>&1; then
        echo "azure"
        return 0
    fi
    return 1
}

# Function to check if running on Railway
detect_railway() {
    if [ -n "$RAILWAY_PROJECT_ID" ]; then
        echo "railway"
        return 0
    fi
    return 1
}

# Function to check if running on Vercel
detect_vercel() {
    if [ -n "$VERCEL" ]; then
        echo "vercel"
        return 0
    fi
    return 1
}

# Detect cloud platform
CLOUD_PLATFORM="local"

if detect_aws; then
    CLOUD_PLATFORM="aws"
elif detect_gcp; then
    CLOUD_PLATFORM="gcp"
elif detect_azure; then
    CLOUD_PLATFORM="azure"
elif detect_railway; then
    CLOUD_PLATFORM="railway"
elif detect_vercel; then
    CLOUD_PLATFORM="vercel"
fi

echo "☁️  Detected platform: $CLOUD_PLATFORM"

# Export cloud platform
export CLOUD_PLATFORM="$CLOUD_PLATFORM"

# Set cloud-specific environment variables
case $CLOUD_PLATFORM in
    "aws")
        export DATABASE_URL="${DATABASE_URL:-$(aws secretsmanager get-secret-value --secret-id prod/mongodb-uri --query SecretString --output text 2>/dev/null || echo '')}"
        export REDIS_URL="${REDIS_URL:-$(aws secretsmanager get-secret-value --secret-id prod/redis-url --query SecretString --output text 2>/dev/null || echo '')}"
        export JWT_SECRET="${JWT_SECRET:-$(aws secretsmanager get-secret-value --secret-id prod/jwt-secret --query SecretString --output text 2>/dev/null || echo '')}"
        export ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(aws secretsmanager get-secret-value --secret-id prod/encryption-key --query SecretString --output text 2>/dev/null || echo '')}"
        export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-$(aws secretsmanager get-secret-value --secret-id prod/stripe-secret --query SecretString --output text 2>/dev/null || echo '')}"
        export OPENAI_API_KEY="${OPENAI_API_KEY:-$(aws secretsmanager get-secret-value --secret-id prod/openai-key --query SecretString --output text 2>/dev/null || echo '')}"
        ;;

    "gcp")
        export DATABASE_URL="${DATABASE_URL:-$(gcloud secrets versions access latest --secret=mongodb-uri 2>/dev/null || echo '')}"
        export REDIS_URL="${REDIS_URL:-$(gcloud secrets versions access latest --secret=redis-url 2>/dev/null || echo '')}"
        export JWT_SECRET="${JWT_SECRET:-$(gcloud secrets versions access latest --secret=jwt-secret 2>/dev/null || echo '')}"
        export ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(gcloud secrets versions access latest --secret=encryption-key 2>/dev/null || echo '')}"
        export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-$(gcloud secrets versions access latest --secret=stripe-secret 2>/dev/null || echo '')}"
        export OPENAI_API_KEY="${OPENAI_API_KEY:-$(gcloud secrets versions access latest --secret=openai-key 2>/dev/null || echo '')}"
        ;;

    "azure")
        export DATABASE_URL="${DATABASE_URL:-$(az keyvault secret show --name mongodb-uri --vault-name $AZURE_KEYVAULT_NAME --query value -o tsv 2>/dev/null || echo '')}"
        export REDIS_URL="${REDIS_URL:-$(az keyvault secret show --name redis-url --vault-name $AZURE_KEYVAULT_NAME --query value -o tsv 2>/dev/null || echo '')}"
        export JWT_SECRET="${JWT_SECRET:-$(az keyvault secret show --name jwt-secret --vault-name $AZURE_KEYVAULT_NAME --query value -o tsv 2>/dev/null || echo '')}"
        export ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(az keyvault secret show --name encryption-key --vault-name $AZURE_KEYVAULT_NAME --query value -o tsv 2>/dev/null || echo '')}"
        export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-$(az keyvault secret show --name stripe-secret --vault-name $AZURE_KEYVAULT_NAME --query value -o tsv 2>/dev/null || echo '')}"
        export OPENAI_API_KEY="${OPENAI_API_KEY:-$(az keyvault secret show --name openai-key --vault-name $AZURE_KEYVAULT_NAME --query value -o tsv 2>/dev/null || echo '')}"
        ;;

    "railway")
        # Railway automatically injects environment variables
        echo "✅ Railway environment detected - using injected environment variables"
        ;;

    "vercel")
        # Vercel automatically injects environment variables
        echo "✅ Vercel environment detected - using injected environment variables"
        ;;

    "local")
        echo "🏠 Local development environment detected"
        # Load local environment files if they exist
        if [ -f ".env.local" ]; then
            export $(grep -v '^#' .env.local | xargs)
        fi
        ;;
esac

# Set default values for common environment variables
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-5000}"
export FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
export API_URL="${API_URL:-http://localhost:5000}"

# Database defaults based on cloud platform
case $CLOUD_PLATFORM in
    "aws")
        export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/nexttechfusion}"
        export REDIS_HOST="${REDIS_HOST:-localhost}"
        export REDIS_PORT="${REDIS_PORT:-6379}"
        ;;
    "gcp")
        export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/nexttechfusion}"
        export REDIS_HOST="${REDIS_HOST:-localhost}"
        export REDIS_PORT="${REDIS_PORT:-6379}"
        ;;
    "azure")
        export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/nexttechfusion}"
        export REDIS_HOST="${REDIS_HOST:-localhost}"
        export REDIS_PORT="${REDIS_PORT:-6379}"
        ;;
    *)
        export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/nexttechfusion}"
        export REDIS_HOST="${REDIS_HOST:-localhost}"
        export REDIS_PORT="${REDIS_PORT:-6379}"
        ;;
esac

echo "✅ Cloud configuration loaded for $CLOUD_PLATFORM"
echo "🌐 API URL: $API_URL"
echo "🗄️  Database: $(echo $MONGODB_URI | sed 's|//.*@|//***:***@|')"
echo "🔄 Redis: $REDIS_HOST:$REDIS_PORT"