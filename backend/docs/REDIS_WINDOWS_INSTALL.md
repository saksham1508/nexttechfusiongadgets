# Redis Installation Guide for Windows

## Quick Start (Recommended)

### Option 1: Using Docker (Easiest)
1. Install Docker Desktop for Windows
2. Run Redis container:
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```
3. Test connection:
```bash
npm run test:redis
```

### Option 2: Windows Subsystem for Linux (WSL)
1. Install WSL2 from Microsoft Store
2. Install Ubuntu from Microsoft Store
3. In Ubuntu terminal:
```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

### Option 3: Native Windows Installation
1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Redis will start on `localhost:6379`

## Verification

After installation, test your Redis connection:
```bash
cd backend
npm run test:redis
```

You should see:
```
✅ Redis connection test PASSED
   Your Redis server is running and accessible
```

## Configuration

Your application is already configured to work with Redis at `localhost:6379`. 

If you need to change the configuration, update the `.env` file:
```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Troubleshooting

### Redis not starting
- Check if port 6379 is available
- Try running `redis-server.exe` directly
- Check Windows Firewall settings

### Connection refused
- Ensure Redis server is running
- Check the port configuration
- Verify Redis is listening on all interfaces

### Performance issues
- Consider increasing Redis memory limit
- Monitor Redis performance with `redis-cli info`

## Without Redis

Your application will work without Redis using memory cache fallback:
- ✅ All features remain functional
- ⚠️ Cache is lost on server restart
- ⚠️ No shared cache between server instances
- ⚠️ Rate limiting is disabled

## Production Recommendations

For production deployment:
1. Use Redis Cloud or AWS ElastiCache
2. Enable Redis persistence
3. Set up Redis monitoring
4. Configure Redis authentication
5. Use Redis Cluster for high availability

## Support

If you encounter issues:
1. Check Redis server logs
2. Run `npm run test:redis` for diagnostics
3. Verify environment variables
4. Check network connectivity