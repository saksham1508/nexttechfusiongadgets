# Cloud Deployment Guide

This directory contains deployment configurations for major cloud platforms to make NextTechFusionGadgets easily deployable across different cloud providers.

## Supported Platforms

### Amazon Web Services (AWS)
- **Service**: ECS Fargate
- **Database**: DocumentDB (MongoDB-compatible)
- **Cache**: ElastiCache (Redis)
- **Storage**: S3
- **CDN**: CloudFront

### Google Cloud Platform (GCP)
- **Service**: Cloud Run
- **Database**: Cloud MongoDB (or MongoDB Atlas)
- **Cache**: Memorystore (Redis)
- **Storage**: Cloud Storage
- **CDN**: Cloud CDN

### Microsoft Azure
- **Service**: Container Apps
- **Database**: Cosmos DB (MongoDB API)
- **Cache**: Cache for Redis
- **Storage**: Blob Storage
- **CDN**: Azure CDN

## Prerequisites

### For All Platforms
1. Docker installed locally
2. Cloud CLI tools installed (aws-cli, gcloud, az)
3. Git repository access
4. Environment variables configured

### AWS Prerequisites
- AWS Account with appropriate permissions
- ECR repository created
- ECS cluster and services configured
- Secrets Manager secrets created

### GCP Prerequisites
- GCP Project with billing enabled
- Cloud Run API enabled
- Secret Manager API enabled
- Container Registry or Artifact Registry

### Azure Prerequisites
- Azure subscription
- Resource group created
- Container Registry created
- Container Apps environment

## Environment Variables

Create the following secrets in your cloud provider's secret management service:

### Required Secrets
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `REDIS_URL`: Redis connection URL
- `STRIPE_SECRET_KEY`: Stripe payment secret
- `OPENAI_API_KEY`: OpenAI API key (optional)

### Optional Secrets
- `GEMINI_API_KEY`: Google Gemini API key
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `PAYPAL_CLIENT_ID`: PayPal client ID
- `PAYPAL_CLIENT_SECRET`: PayPal client secret

## Deployment Steps

### AWS Deployment

1. **Configure AWS CLI**:
   ```bash
   aws configure
   ```

2. **Update task-definition.json**:
   - Replace `ACCOUNT_ID` with your AWS account ID
   - Replace `REGION` with your preferred region

3. **Create Secrets in AWS Secrets Manager**:
   ```bash
   aws secretsmanager create-secret --name prod/mongodb-uri --secret-string "your-mongodb-uri"
   aws secretsmanager create-secret --name prod/jwt-secret --secret-string "your-jwt-secret"
   # ... create other secrets
   ```

4. **Run deployment**:
   ```bash
   cd deployments/aws
   chmod +x deploy.sh
   ./deploy.sh
   ```

### GCP Deployment

1. **Configure Google Cloud CLI**:
   ```bash
   gcloud init
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Update cloud-run.yaml**:
   - Replace `PROJECT_ID` with your GCP project ID

3. **Create Secrets in Secret Manager**:
   ```bash
   echo -n "your-mongodb-uri" | gcloud secrets create mongodb-uri --data-file=-
   echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
   # ... create other secrets
   ```

4. **Run deployment**:
   ```bash
   cd deployments/gcp
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Azure Deployment

1. **Configure Azure CLI**:
   ```bash
   az login
   az account set --subscription YOUR_SUBSCRIPTION_ID
   ```

2. **Update container-app.yaml**:
   - Replace `SUBSCRIPTION_ID` with your subscription ID
   - Replace `RESOURCE_GROUP` with your resource group name

3. **Update deploy.sh**:
   - Set your subscription ID, resource group, etc.

4. **Run deployment**:
   ```bash
   cd deployments/azure
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Database Setup

### MongoDB Atlas (Multi-Cloud)
1. Create cluster on MongoDB Atlas
2. Add IP whitelist (0.0.0.0/0 for cloud deployments)
3. Create database user
4. Get connection string

### Cloud-Specific Databases
- **AWS**: Use DocumentDB
- **GCP**: Use Cloud MongoDB or MongoDB Atlas
- **Azure**: Use Cosmos DB with MongoDB API

## Redis Setup

### Cloud Redis Services
- **AWS**: ElastiCache for Redis
- **GCP**: Memorystore for Redis
- **Azure**: Azure Cache for Redis

## Monitoring and Logging

### AWS
- CloudWatch for logs and metrics
- X-Ray for tracing
- ECS service auto-scaling

### GCP
- Cloud Logging
- Cloud Monitoring
- Cloud Trace

### Azure
- Azure Monitor
- Application Insights
- Azure Log Analytics

## Security Considerations

1. **Secrets Management**: Never commit secrets to code
2. **Network Security**: Use VPC/security groups
3. **Access Control**: Implement least privilege IAM
4. **SSL/TLS**: Enable HTTPS everywhere
5. **Regular Updates**: Keep dependencies updated

## Scaling

### Horizontal Scaling
- AWS: ECS service auto-scaling
- GCP: Cloud Run automatic scaling
- Azure: Container Apps scaling rules

### Vertical Scaling
- Adjust CPU/memory limits based on load
- Monitor performance metrics
- Use load testing to determine optimal resources

## Troubleshooting

### Common Issues
1. **Health Check Failures**: Verify /api/health endpoint
2. **Database Connection**: Check connection strings and firewall rules
3. **Secret Access**: Verify IAM permissions for secret access
4. **Image Pull Errors**: Check registry permissions and image names

### Logs
- AWS: CloudWatch Logs
- GCP: Cloud Logging
- Azure: Container Apps logs

## Cost Optimization

1. **Right-sizing**: Monitor usage and adjust resources
2. **Auto-scaling**: Scale down during low traffic
3. **Reserved Instances**: Use for predictable workloads
4. **Spot Instances**: Consider for non-critical workloads (where supported)

## CI/CD Integration

Consider integrating with:
- **AWS**: CodePipeline + CodeBuild
- **GCP**: Cloud Build
- **Azure**: Azure DevOps Pipelines

Example GitHub Actions workflow included in `.github/workflows/` directory.