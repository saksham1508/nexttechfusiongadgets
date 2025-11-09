#!/usr/bin/env node

/**
 * Cloud-Native Secret Management
 * Retrieves secrets from cloud secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Detect cloud platform
function detectCloudPlatform() {
    if (process.env.AWS_REGION || process.env.AWS_EXECUTION_ENV) {
        return 'aws';
    }
    if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GAE_ENV) {
        return 'gcp';
    }
    if (process.env.WEBSITE_SITE_NAME || process.env.WEBSITE_INSTANCE_ID) {
        return 'azure';
    }
    if (process.env.RAILWAY_PROJECT_ID) {
        return 'railway';
    }
    if (process.env.VERCEL) {
        return 'vercel';
    }
    return 'local';
}

// AWS Secrets Manager
async function getAWSSecrets(secrets) {
    const retrievedSecrets = {};

    for (const [envVar, secretId] of Object.entries(secrets)) {
        try {
            console.log(`🔐 Retrieving ${envVar} from AWS Secrets Manager...`);
            const command = `aws secretsmanager get-secret-value --secret-id ${secretId} --query SecretString --output text`;
            const secretValue = execSync(command, { encoding: 'utf8' }).trim();

            // Parse JSON if it's a JSON secret
            try {
                const parsed = JSON.parse(secretValue);
                if (typeof parsed === 'object') {
                    Object.assign(retrievedSecrets, parsed);
                } else {
                    retrievedSecrets[envVar] = secretValue;
                }
            } catch {
                retrievedSecrets[envVar] = secretValue;
            }
        } catch (error) {
            console.warn(`⚠️  Failed to retrieve ${envVar} from AWS Secrets Manager:`, error.message);
        }
    }

    return retrievedSecrets;
}

// GCP Secret Manager
async function getGCPSecrets(secrets) {
    const retrievedSecrets = {};

    for (const [envVar, secretId] of Object.entries(secrets)) {
        try {
            console.log(`🔐 Retrieving ${envVar} from GCP Secret Manager...`);
            const command = `gcloud secrets versions access latest --secret=${secretId}`;
            const secretValue = execSync(command, { encoding: 'utf8' }).trim();

            retrievedSecrets[envVar] = secretValue;
        } catch (error) {
            console.warn(`⚠️  Failed to retrieve ${envVar} from GCP Secret Manager:`, error.message);
        }
    }

    return retrievedSecrets;
}

// Azure Key Vault
async function getAzureSecrets(secrets) {
    const retrievedSecrets = {};
    const keyVaultName = process.env.AZURE_KEYVAULT_NAME;

    if (!keyVaultName) {
        console.warn('⚠️  AZURE_KEYVAULT_NAME not set, skipping Azure secrets');
        return retrievedSecrets;
    }

    for (const [envVar, secretName] of Object.entries(secrets)) {
        try {
            console.log(`🔐 Retrieving ${envVar} from Azure Key Vault...`);
            const command = `az keyvault secret show --name ${secretName} --vault-name ${keyVaultName} --query value -o tsv`;
            const secretValue = execSync(command, { encoding: 'utf8' }).trim();

            retrievedSecrets[envVar] = secretValue;
        } catch (error) {
            console.warn(`⚠️  Failed to retrieve ${envVar} from Azure Key Vault:`, error.message);
        }
    }

    return retrievedSecrets;
}

// Local environment file fallback
function getLocalSecrets(secrets) {
    const retrievedSecrets = {};
    const envFiles = ['.env.local', '.env.development', '.env.production'];

    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            console.log(`📄 Loading secrets from ${envFile}...`);
            const envContent = fs.readFileSync(envFile, 'utf8');
            const envVars = envContent.split('\n')
                .filter(line => line.includes('=') && !line.startsWith('#'))
                .reduce((acc, line) => {
                    const [key, ...valueParts] = line.split('=');
                    acc[key.trim()] = valueParts.join('=').trim();
                    return acc;
                }, {});

            // Only include secrets that are in our secrets list
            Object.keys(secrets).forEach(envVar => {
                if (envVars[envVar]) {
                    retrievedSecrets[envVar] = envVars[envVar];
                }
            });
        }
    }

    return retrievedSecrets;
}

// Define secrets to retrieve based on platform
function getSecretsConfig(platform) {
    const baseSecrets = {
        MONGODB_URI: 'prod/mongodb-uri',
        REDIS_URL: 'prod/redis-url',
        JWT_SECRET: 'prod/jwt-secret',
        ENCRYPTION_KEY: 'prod/encryption-key',
        STRIPE_SECRET_KEY: 'prod/stripe-secret',
        OPENAI_API_KEY: 'prod/openai-key',
        GEMINI_API_KEY: 'prod/gemini-key',
        EMAIL_USER: 'prod/email-user',
        EMAIL_PASS: 'prod/email-pass',
        PAYPAL_CLIENT_ID: 'prod/paypal-client-id',
        PAYPAL_CLIENT_SECRET: 'prod/paypal-client-secret'
    };

    // Platform-specific secret names
    const platformConfigs = {
        aws: baseSecrets,
        gcp: {
            MONGODB_URI: 'mongodb-uri',
            REDIS_URL: 'redis-url',
            JWT_SECRET: 'jwt-secret',
            ENCRYPTION_KEY: 'encryption-key',
            STRIPE_SECRET_KEY: 'stripe-secret',
            OPENAI_API_KEY: 'openai-key',
            GEMINI_API_KEY: 'gemini-key',
            EMAIL_USER: 'email-user',
            EMAIL_PASS: 'email-pass',
            PAYPAL_CLIENT_ID: 'paypal-client-id',
            PAYPAL_CLIENT_SECRET: 'paypal-client-secret'
        },
        azure: {
            MONGODB_URI: 'mongodb-uri',
            REDIS_URL: 'redis-url',
            JWT_SECRET: 'jwt-secret',
            ENCRYPTION_KEY: 'encryption-key',
            STRIPE_SECRET_KEY: 'stripe-secret',
            OPENAI_API_KEY: 'openai-key',
            GEMINI_API_KEY: 'gemini-key',
            EMAIL_USER: 'email-user',
            EMAIL_PASS: 'email-pass',
            PAYPAL_CLIENT_ID: 'paypal-client-id',
            PAYPAL_CLIENT_SECRET: 'paypal-client-secret'
        },
        railway: {}, // Railway injects directly
        vercel: {}, // Vercel injects directly
        local: {} // Use local files
    };

    return platformConfigs[platform] || {};
}

// Main function to retrieve all secrets
async function retrieveSecrets() {
    const platform = detectCloudPlatform();
    console.log(`🔍 Detected platform: ${platform}`);

    const secretsConfig = getSecretsConfig(platform);
    let retrievedSecrets = {};

    try {
        switch (platform) {
            case 'aws':
                retrievedSecrets = await getAWSSecrets(secretsConfig);
                break;
            case 'gcp':
                retrievedSecrets = await getGCPSecrets(secretsConfig);
                break;
            case 'azure':
                retrievedSecrets = await getAzureSecrets(secretsConfig);
                break;
            case 'railway':
            case 'vercel':
                console.log('✅ Platform handles secrets automatically');
                retrievedSecrets = {};
                break;
            default:
                retrievedSecrets = getLocalSecrets(secretsConfig);
        }
    } catch (error) {
        console.error('❌ Error retrieving secrets:', error.message);
        // Fallback to local secrets
        retrievedSecrets = getLocalSecrets(secretsConfig);
    }

    return retrievedSecrets;
}

// Export secrets as environment variables
function exportSecrets(secrets) {
    console.log('\n📋 Retrieved Secrets:');
    Object.entries(secrets).forEach(([key, value]) => {
        process.env[key] = value;
        const maskedValue = value.length > 10 ? value.substring(0, 6) + '***' + value.substring(value.length - 4) : '***';
        console.log(`   ${key}: ${maskedValue}`);
    });

    return secrets;
}

// Write secrets to .env file
function writeSecretsToFile(secrets, filename = '.env.secrets') {
    const envContent = Object.entries(secrets)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(filename, envContent);
    console.log(`✅ Secrets written to ${filename}`);
}

// Main execution
async function main() {
    try {
        console.log('🔐 Retrieving secrets from cloud secret manager...');

        const secrets = await retrieveSecrets();
        exportSecrets(secrets);

        // Optionally write to file
        if (process.argv.includes('--write-file')) {
            writeSecretsToFile(secrets);
        }

        console.log('\n🎉 Secret retrieval completed successfully!');

    } catch (error) {
        console.error('❌ Failed to retrieve secrets:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = {
    detectCloudPlatform,
    retrieveSecrets,
    exportSecrets,
    getSecretsConfig
};

// Run if called directly
if (require.main === module) {
    main();
}