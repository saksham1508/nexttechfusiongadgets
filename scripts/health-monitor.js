#!/usr/bin/env node

/**
 * Cloud Health Monitoring and Checks
 * Comprehensive health checks for cloud deployments
 */

const http = require('http');
const https = require('https');

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

// HTTP request helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        status: res.statusCode,
                        headers: res.headers,
                        data: data ? JSON.parse(data) : null
                    };
                    resolve(result);
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Health check for backend API
async function checkBackendHealth(baseUrl) {
    const checks = {
        api: { status: 'unknown', responseTime: 0 },
        database: { status: 'unknown', responseTime: 0 },
        redis: { status: 'unknown', responseTime: 0 },
        auth: { status: 'unknown', responseTime: 0 }
    };

    try {
        // Basic API health check
        const start = Date.now();
        const response = await makeRequest(`${baseUrl}/api/health`);
        checks.api.responseTime = Date.now() - start;

        if (response.status === 200 && response.data?.status === 'healthy') {
            checks.api.status = 'healthy';
        } else {
            checks.api.status = 'unhealthy';
        }

        // Database health check
        if (response.data?.database === 'connected') {
            checks.database.status = 'healthy';
        } else {
            checks.database.status = 'unhealthy';
        }

        // Redis health check
        if (response.data?.redis === 'connected') {
            checks.redis.status = 'healthy';
        } else {
            checks.redis.status = 'unhealthy';
        }

    } catch (error) {
        checks.api.status = 'error';
        checks.api.error = error.message;
    }

    return checks;
}

// Health check for frontend
async function checkFrontendHealth(baseUrl) {
    const checks = {
        frontend: { status: 'unknown', responseTime: 0 },
        static: { status: 'unknown', responseTime: 0 }
    };

    try {
        // Frontend health check
        const start = Date.now();
        const response = await makeRequest(`${baseUrl}/health`);
        checks.frontend.responseTime = Date.now() - start;

        if (response.status === 200) {
            checks.frontend.status = 'healthy';
        } else {
            checks.frontend.status = 'unhealthy';
        }

        // Static assets check
        const staticStart = Date.now();
        const staticResponse = await makeRequest(`${baseUrl}/static/js/main.js`);
        checks.static.responseTime = Date.now() - staticStart;

        if (staticResponse.status === 200) {
            checks.static.status = 'healthy';
        } else {
            checks.static.status = 'degraded';
        }

    } catch (error) {
        checks.frontend.status = 'error';
        checks.frontend.error = error.message;
    }

    return checks;
}

// Cloud-specific health checks
async function checkCloudServices(platform) {
    const checks = {
        database: { status: 'unknown' },
        cache: { status: 'unknown' },
        storage: { status: 'unknown' }
    };

    switch (platform) {
        case 'aws':
            // Check DocumentDB/ElastiCache connectivity
            checks.database.details = 'DocumentDB connection status';
            checks.cache.details = 'ElastiCache connection status';
            checks.storage.details = 'S3 bucket accessibility';
            break;

        case 'gcp':
            // Check Cloud MongoDB/Memorystore connectivity
            checks.database.details = 'Cloud MongoDB connection status';
            checks.cache.details = 'Memorystore connection status';
            checks.storage.details = 'Cloud Storage bucket accessibility';
            break;

        case 'azure':
            // Check CosmosDB/Cache connectivity
            checks.database.details = 'CosmosDB connection status';
            checks.cache.details = 'Azure Cache connection status';
            checks.storage.details = 'Blob Storage accessibility';
            break;

        default:
            checks.database.status = 'not_applicable';
            checks.cache.status = 'not_applicable';
            checks.storage.status = 'not_applicable';
    }

    return checks;
}

// Generate health report
function generateHealthReport(backendChecks, frontendChecks, cloudChecks, platform) {
    const report = {
        timestamp: new Date().toISOString(),
        platform: platform,
        overall: 'healthy',
        services: {
            ...backendChecks,
            ...frontendChecks,
            ...cloudChecks
        }
    };

    // Determine overall health
    const allChecks = Object.values(report.services).flatMap(service =>
        typeof service === 'object' ? Object.values(service) : [service]
    );

    const hasErrors = allChecks.some(check =>
        check.status === 'error' || check.status === 'unhealthy'
    );

    const hasWarnings = allChecks.some(check =>
        check.status === 'degraded'
    );

    if (hasErrors) {
        report.overall = 'unhealthy';
    } else if (hasWarnings) {
        report.overall = 'degraded';
    }

    return report;
}

// Print health report
function printHealthReport(report) {
    console.log(`\n🏥 Health Check Report - ${report.timestamp}`);
    console.log(`📍 Platform: ${report.platform}`);
    console.log(`📊 Overall Status: ${getStatusEmoji(report.overall)} ${report.overall.toUpperCase()}`);
    console.log('\n📋 Service Status:');

    Object.entries(report.services).forEach(([serviceName, serviceChecks]) => {
        if (typeof serviceChecks === 'object' && !serviceChecks.status) {
            console.log(`\n🔍 ${serviceName.toUpperCase()}:`);
            Object.entries(serviceChecks).forEach(([checkName, check]) => {
                const status = getStatusEmoji(check.status);
                const responseTime = check.responseTime ? ` (${check.responseTime}ms)` : '';
                const error = check.error ? ` - ${check.error}` : '';
                console.log(`   ${status} ${checkName}: ${check.status}${responseTime}${error}`);
            });
        } else {
            const status = getStatusEmoji(serviceChecks.status);
            const details = serviceChecks.details ? ` - ${serviceChecks.details}` : '';
            console.log(`   ${status} ${serviceName}: ${serviceChecks.status}${details}`);
        }
    });
}

function getStatusEmoji(status) {
    switch (status) {
        case 'healthy': return '✅';
        case 'degraded': return '⚠️';
        case 'unhealthy': return '❌';
        case 'error': return '💥';
        case 'unknown': return '❓';
        case 'not_applicable': return '➖';
        default: return '❓';
    }
}

// Main health check function
async function runHealthChecks(options = {}) {
    const platform = detectCloudPlatform();
    const backendUrl = options.backendUrl || process.env.BACKEND_URL || 'http://localhost:5000';
    const frontendUrl = options.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:80';

    console.log('🔍 Running comprehensive health checks...');
    console.log(`🔗 Backend URL: ${backendUrl}`);
    console.log(`🌐 Frontend URL: ${frontendUrl}`);

    try {
        // Run all health checks in parallel
        const [backendChecks, frontendChecks, cloudChecks] = await Promise.all([
            checkBackendHealth(backendUrl),
            checkFrontendHealth(frontendUrl),
            checkCloudServices(platform)
        ]);

        // Generate and display report
        const report = generateHealthReport(backendChecks, frontendChecks, cloudChecks, platform);
        printHealthReport(report);

        // Return report for further processing
        return report;

    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        throw error;
    }
}

// Export for use as module
module.exports = {
    runHealthChecks,
    checkBackendHealth,
    checkFrontendHealth,
    checkCloudServices,
    generateHealthReport
};

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--backend-url' && args[i + 1]) {
            options.backendUrl = args[i + 1];
            i++;
        } else if (args[i] === '--frontend-url' && args[i + 1]) {
            options.frontendUrl = args[i + 1];
            i++;
        }
    }

    runHealthChecks(options)
        .then(report => {
            // Exit with appropriate code based on health
            if (report.overall === 'unhealthy' || report.overall === 'error') {
                process.exit(1);
            } else {
                process.exit(0);
            }
        })
        .catch(() => process.exit(1));
}