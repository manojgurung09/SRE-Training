# Common Issues

Common problems and their solutions.

## Environment Variable Issues

### Missing Environment Variables

**Symptom:** Application exits with configuration error

**Error:**
```
❌ Supabase backend configuration error
SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing
```

**Solution:**
1. Check `.env` file exists
2. Verify required variables are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Restart application

**Source:** Environment validation in `server/config/supabase.ts` lines 21-25.

### Invalid Service Role Key

**Symptom:** Application exits with key format error

**Error:**
```
❌ INVALID SUPABASE SERVICE ROLE KEY FORMAT
Loaded key does not look like a JWT.
```

**Solution:**
1. Verify key starts with `eyJhbGciOi`
2. Check key is service role key (not anon key)
3. Regenerate key in Supabase Dashboard if needed

**Source:** Key validation in `server/config/supabase.ts` lines 28-33.

## Port Conflicts

### Port Already in Use

**Symptom:** `EADDRINUSE: address already in use :::3000`

**Solution:**
1. Find process using port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```
2. Kill process or change `PORT` in `.env`

**Source:** Port configuration in `server/index.ts` line 10.

## Application Startup Issues

### Application Won't Start

**Symptoms:**
- Process exits immediately
- No logs generated
- Error on startup

**Solutions:**
1. Check environment variables
2. Verify database connectivity
3. Check logs for errors
4. Verify Node.js version (20+)

**Source:** Startup issues troubleshooting.

## Health Check Failures

### Health Endpoint Returns 500

**Symptom:** `/api/health` returns error

**Solutions:**
1. Check database connectivity
2. Verify Supabase project is active
3. Check service role key
4. Review application logs

**Source:** Health endpoint in `server/routes/health.ts`.

### Readiness Check Fails

**Symptom:** `/api/health/ready` returns not ready

**Solutions:**
1. Check database query succeeds
2. Verify database connection
3. Check Supabase project status
4. Review readiness logic

**Source:** Readiness endpoint in `server/routes/health.ts` line 12.

## API Request Issues

### 404 Not Found

**Symptom:** API routes return 404

**Solutions:**
1. Verify route path is correct
2. Check route registration in `server/app.ts`
3. Verify API base path (`/api`)

**Source:** Route registration in `server/app.ts` lines 44-48.

### 500 Internal Server Error

**Symptom:** API returns 500 errors

**Solutions:**
1. Check application logs
2. Verify database connectivity
3. Check error handler logs
4. Review error metrics

**Source:** Error handling in `server/middleware/errorHandler.ts`.

## Cache Issues

### Cache Not Working

**Symptom:** Cache misses, no caching

**Solutions:**
1. Check `CACHE_TYPE` environment variable
2. Verify Redis connection (if using Redis)
3. Check cache middleware is applied
4. Review cache logs

**Source:** Cache configuration in `server/config/deployment.ts` line 27.

## Next Steps

- [Deployment Issues](03-deployment-issues.md) - Deployment troubleshooting
- [Database Issues](04-database-issues.md) - Database troubleshooting
- [Redis Issues](05-redis-issues.md) - Redis troubleshooting

