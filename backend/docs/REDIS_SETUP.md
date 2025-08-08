# Redis Configuration Guide

This guide explains how to configure Redis for the NextTechFusionGadgets backend.

## Overview

The application supports two Redis configuration methods:
1. **Redis URL** (recommended for production)
2. **Individual environment variables** (flexible for development)

## Configuration Options

### Option 1: Redis URL (Priority)
Set the `REDIS_URL` environment variable:
```bash
REDIS_URL=redis://localhost:6379
# or with password
REDIS_URL=redis://:password@localhost:6379
# or with database selection
REDIS_URL=redis://localhost:6379/0
```

### Option 2: Individual Variables (Fallback)
Set individual Redis environment variables:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password  # optional
REDIS_DB=0                    # optional, defaults to 0
```

## Installation & Setup

### Windows
1. Download Redis from https://redis.io/download
2. Install and start Redis server
3. Default connection: `localhost:6379`

### macOS
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Docker
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

## Testing Connection

### Quick Test
```bash
npm run test:redis
```

### Manual Test
```bash
redis-cli ping
# Should return: PONG
```

### Application Test
The server automatically tests Redis connection on startup and logs the result.

## Environment Configuration

Update your `.env` file:
```bash
# Redis Configuration (supports both URL and individual variables)
# Option 1: Redis URL (takes priority if provided)
REDIS_URL=redis://localhost:6379

# Option 2: Individual Redis variables (fallback if REDIS_URL not provided)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Features Using Redis

- **Caching**: Product data, user sessions, search results
- **Rate Limiting**: API request throttling
- **Session Storage**: User authentication sessions
- **Queue Management**: Background job processing
- **Analytics**: Real-time metrics and counters

## Troubleshooting

### Connection Refused
- Ensure Redis server is running
- Check if Redis is listening on the correct port
- Verify firewall settings

### Authentication Failed
- Check if Redis requires a password
- Verify the password in your configuration

### Performance Issues
- Monitor Redis memory usage
- Consider Redis clustering for high load
- Optimize cache TTL values

### Fallback Behavior
If Redis is unavailable:
- Cache operations will be skipped gracefully
- Rate limiting will allow all requests
- Application will continue to function (degraded performance)

## Production Considerations

### Security
- Use Redis AUTH (password protection)
- Configure Redis to bind to specific interfaces
- Use TLS/SSL for Redis connections
- Regularly update Redis version

### Performance
- Configure appropriate memory limits
- Set up Redis persistence (RDB/AOF)
- Monitor Redis metrics
- Consider Redis Cluster for scaling

### Monitoring
- Set up Redis monitoring (Redis Insight, Grafana)
- Monitor memory usage and hit rates
- Track connection counts and latency

## Configuration Examples

### Development
```bash
REDIS_URL=redis://localhost:6379
```

### Production with Authentication
```bash
REDIS_URL=redis://:your_secure_password@redis.example.com:6379/0
```

### Redis Cluster
```bash
REDIS_URL=redis://node1:6379,redis://node2:6379,redis://node3:6379
```

## Support

For Redis-related issues:
1. Check Redis server logs
2. Run the connection test: `npm run test:redis`
3. Verify environment variables
4. Check network connectivity
5. Review Redis configuration file

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Redis Best Practices](https://redis.io/topics/memory-optimization)