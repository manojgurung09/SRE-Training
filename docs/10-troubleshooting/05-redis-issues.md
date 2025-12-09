# Redis Issues

Troubleshooting guide for Redis-related problems.

## Connection Issues

### Redis Connection Failed

**Symptom:** Cannot connect to Redis

**Error:** Connection timeout or connection refused

**Solutions:**
1. **Verify Redis is Running:**
   ```bash
   # Check Redis process
   redis-cli ping
   ```

2. **Check Connection URL:**
   - Verify `REDIS_URL` or `CACHE_REDIS_URL`
   - Format: `redis://host:port`
   - Check host and port are correct

3. **Check Network:**
   - Verify network connectivity
   - Check firewall rules
   - Test Redis port accessibility

**Source:** Redis connection in `server/config/redis.ts` lines 5, 17-28.

### Redis Not Initialized

**Symptom:** Cache operations fail, warnings in logs

**Error:** `Redis not initialized (CACHE_TYPE is not redis)`

**Solutions:**
1. **Check Cache Type:**
   - Verify `CACHE_TYPE=redis` in environment
   - Default is `memory` (no Redis needed)

2. **Initialize Redis:**
   - Set `CACHE_TYPE=redis`
   - Set `CACHE_REDIS_URL` or `REDIS_URL`
   - Restart application

**Source:** Redis initialization in `server/config/redis.ts` lines 10-13.

## Cache Issues

### Cache Not Working

**Symptom:** Cache misses, no data cached

**Solutions:**
1. **Check Redis Connection:**
   - Verify Redis is accessible
   - Check connection logs
   - Test with `redis-cli`

2. **Check Cache Configuration:**
   - Verify `CACHE_TYPE=redis`
   - Check `CACHE_REDIS_URL` is set
   - Review cache middleware configuration

3. **Check Cache Operations:**
   - Review cache logs
   - Check for errors in cache operations
   - Verify TTL values

**Source:** Cache operations in `server/config/redis.ts` lines 44-130.

### Cache Errors

**Symptom:** Cache operations throwing errors

**Solutions:**
1. **Check Redis Status:**
   - Verify Redis is running
   - Check Redis logs
   - Review connection status

2. **Check Memory:**
   - Verify Redis has memory available
   - Check `maxmemory` setting
   - Review eviction policy

3. **Check Keys:**
   - Review cache key patterns
   - Check for key conflicts
   - Verify key format

**Source:** Cache error handling in `server/config/redis.ts`.

## Queue Issues

### Queue Not Working

**Symptom:** Jobs not processing, queue backing up

**Solutions:**
1. **Check Worker Mode:**
   - Verify `WORKER_MODE=bull-queue`
   - Default is `in-process` (no queue)

2. **Check Queue Redis:**
   - Verify `QUEUE_REDIS_URL` is set
   - Check Redis connection
   - Test queue Redis separately from cache Redis

3. **Check Workers:**
   - Verify workers are running
   - Check worker logs
   - Review worker configuration

**Source:** Queue configuration in `server/config/queue.ts` line 4.

### Queue Connection Failed

**Symptom:** Workers cannot connect to queue

**Solutions:**
1. **Check Queue Redis URL:**
   - Verify `QUEUE_REDIS_URL` format
   - Check host and port
   - Test connection

2. **Check Redis Status:**
   - Verify queue Redis is running
   - Check Redis logs
   - Review connection settings

**Source:** Queue Redis connection.

## Performance Issues

### Slow Redis Operations

**Symptom:** Cache operations taking too long

**Solutions:**
1. **Check Network Latency:**
   - Test Redis connection latency
   - Check network path
   - Consider local Redis for cache

2. **Check Redis Load:**
   - Review Redis metrics
   - Check memory usage
   - Review operation patterns

3. **Optimize Operations:**
   - Use pipelining for bulk operations
   - Review key patterns
   - Optimize TTL values

**Source:** Redis performance optimization.

## Retry Issues

### Excessive Retries

**Symptom:** High retry count in metrics

**Solutions:**
1. **Check Connection Stability:**
   - Review connection errors
   - Check network stability
   - Verify Redis availability

2. **Review Retry Strategy:**
   - Check retry configuration
   - Review retry delays
   - Adjust retry limits

**Source:** Retry strategy in `server/config/redis.ts` lines 19-23.

## Next Steps

- [Troubleshooting Overview](01-troubleshooting-overview.md) - Troubleshooting guide
- [Worker Issues](06-worker-issues.md) - Worker troubleshooting
- [Common Issues](02-common-issues.md) - Common problems

