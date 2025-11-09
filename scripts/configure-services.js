#!/usr/bin/env node

/**
 * Cloud Service Configuration Script
 * Automatically configures database and cache connections based on cloud platform
 */

const fs = require('fs');
const path = require('path');

// Detect cloud platform from environment
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

// Get service configurations based on cloud platform
function getServiceConfig(platform) {
    const configs = {
        aws: {
            database: {
                type: 'documentdb',
                host: process.env.DOCUMENTDB_ENDPOINT || 'localhost',
                port: process.env.DOCUMENTDB_PORT || 27017,
                database: process.env.DOCUMENTDB_DATABASE || 'nexttechfusion',
                ssl: true,
                replicaSet: 'rs0'
            },
            cache: {
                type: 'elasticache',
                host: process.env.ELASTICACHE_ENDPOINT || 'localhost',
                port: process.env.ELASTICACHE_PORT || 6379,
                password: process.env.ELASTICACHE_PASSWORD
            },
            storage: {
                type: 's3',
                bucket: process.env.S3_BUCKET_NAME || 'nexttechfusion-uploads',
                region: process.env.AWS_REGION || 'us-east-1'
            }
        },
        gcp: {
            database: {
                type: 'cloud-mongodb',
                host: process.env.MONGODB_HOST || 'localhost',
                port: process.env.MONGODB_PORT || 27017,
                database: process.env.MONGODB_DATABASE || 'nexttechfusion',
                ssl: true
            },
            cache: {
                type: 'memorystore',
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD
            },
            storage: {
                type: 'cloud-storage',
                bucket: process.env.GCS_BUCKET_NAME || 'nexttechfusion-uploads',
                project: process.env.GOOGLE_CLOUD_PROJECT
            }
        },
        azure: {
            database: {
                type: 'cosmosdb-mongodb',
                host: process.env.COSMOSDB_HOST || 'localhost',
                port: process.env.COSMOSDB_PORT || 27017,
                database: process.env.COSMOSDB_DATABASE || 'nexttechfusion',
                ssl: true
            },
            cache: {
                type: 'azure-cache',
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD,
                ssl: true
            },
            storage: {
                type: 'blob-storage',
                container: process.env.AZURE_STORAGE_CONTAINER || 'uploads',
                account: process.env.AZURE_STORAGE_ACCOUNT
            }
        },
        railway: {
            database: {
                type: 'mongodb-atlas',
                uri: process.env.MONGODB_URI || process.env.DATABASE_URL
            },
            cache: {
                type: 'redis',
                url: process.env.REDIS_URL
            }
        },
        vercel: {
            database: {
                type: 'mongodb-atlas',
                uri: process.env.MONGODB_URI || process.env.DATABASE_URL
            },
            cache: {
                type: 'redis',
                url: process.env.REDIS_URL
            }
        },
        local: {
            database: {
                type: 'mongodb',
                host: process.env.MONGODB_HOST || 'localhost',
                port: process.env.MONGODB_PORT || 27017,
                database: process.env.MONGODB_DATABASE || 'nexttechfusion'
            },
            cache: {
                type: 'redis',
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD
            },
            storage: {
                type: 'local',
                path: process.env.UPLOAD_PATH || './uploads'
            }
        }
    };

    return configs[platform] || configs.local;
}

// Build MongoDB connection string
function buildMongoConnectionString(config) {
    if (config.uri) {
        return config.uri;
    }

    let connectionString = 'mongodb://';

    // Add authentication if available
    if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
        connectionString += `${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@`;
    }

    connectionString += `${config.host}:${config.port}/${config.database}`;

    // Add connection options
    const options = [];
    if (config.ssl) options.push('ssl=true');
    if (config.replicaSet) options.push(`replicaSet=${config.replicaSet}`);
    if (process.env.MONGODB_AUTH_SOURCE) options.push(`authSource=${process.env.MONGODB_AUTH_SOURCE}`);

    if (options.length > 0) {
        connectionString += `?${options.join('&')}`;
    }

    return connectionString;
}

// Build Redis connection URL
function buildRedisConnectionString(config) {
    if (config.url) {
        return config.url;
    }

    let connectionString = 'redis://';

    // Add password if available
    if (config.password) {
        connectionString += `:${config.password}@`;
    }

    connectionString += `${config.host}:${config.port}`;

    // Add SSL for cloud services
    if (config.ssl) {
        connectionString += '?ssl=true';
    }

    return connectionString;
}

// Generate environment configuration
function generateEnvConfig() {
    const platform = detectCloudPlatform();
    const services = getServiceConfig(platform);

    console.log(`🔍 Detected cloud platform: ${platform}`);
    console.log('🔧 Configuring services...');

    const envConfig = {
        CLOUD_PLATFORM: platform,
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 5000,

        // Database configuration
        MONGODB_URI: buildMongoConnectionString(services.database),

        // Cache configuration
        REDIS_URL: buildRedisConnectionString(services.cache),

        // Storage configuration
        STORAGE_TYPE: services.storage?.type || 'local',
        UPLOAD_PATH: services.storage?.path || './uploads',
        S3_BUCKET: services.storage?.bucket,
        GCS_BUCKET: services.storage?.bucket,
        AZURE_STORAGE_CONTAINER: services.storage?.container,
        AZURE_STORAGE_ACCOUNT: services.storage?.account,

        // Service-specific settings
        DATABASE_TYPE: services.database.type,
        CACHE_TYPE: services.cache.type,

        // Default values
        JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
    };

    return envConfig;
}

// Write configuration to file
function writeConfigToFile(config, filename = '.env.runtime') {
    const envContent = Object.entries(config)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(filename, envContent);
    console.log(`✅ Configuration written to ${filename}`);
}

// Main execution
function main() {
    try {
        const config = generateEnvConfig();

        // Print configuration summary
        console.log('\n📋 Service Configuration Summary:');
        console.log(`   Database: ${config.DATABASE_TYPE}`);
        console.log(`   Cache: ${config.CACHE_TYPE}`);
        console.log(`   Storage: ${config.STORAGE_TYPE}`);
        console.log(`   MongoDB URI: ${config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
        console.log(`   Redis URL: ${config.REDIS_URL.replace(/\/\/.*@/, '//***:***@')}`);

        // Write to file
        writeConfigToFile(config);

        console.log('\n🎉 Service configuration completed successfully!');
        console.log('💡 Load this configuration in your application using:');
        console.log('   require(\'dotenv\').config({ path: \'.env.runtime\' })');

    } catch (error) {
        console.error('❌ Error configuring services:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = {
    detectCloudPlatform,
    getServiceConfig,
    buildMongoConnectionString,
    buildRedisConnectionString,
    generateEnvConfig
};

// Run if called directly
if (require.main === module) {
    main();
}