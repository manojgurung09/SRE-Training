# Database Issues

Troubleshooting guide for database-related problems.

## Connection Issues

### Database Connection Failed

**Symptom:** Cannot connect to Supabase

**Error:** Connection timeout or authentication error

**Solutions:**
1. **Verify Supabase Project Status:**
   - Check Supabase Dashboard
   - Ensure project is not paused (free tier)
   - Resume project if paused

2. **Check Credentials:**
   - Verify `SUPABASE_URL` is correct
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is valid
   - Check key hasn't been rotated

3. **Check Network:**
   - Verify internet connectivity
   - Check firewall rules
   - Test Supabase URL accessibility

**Source:** Database connection in `server/config/supabase.ts`.

### Invalid Service Role Key

**Symptom:** Authentication errors

**Error:** `Invalid API key` or similar

**Solutions:**
1. Verify key format (must start with `eyJhbGciOi`)
2. Check key is service role key (not anon key)
3. Regenerate key in Supabase Dashboard
4. Update `.env` file with new key

**Source:** Key validation in `server/config/supabase.ts` lines 28-33.

## Query Issues

### Query Errors

**Symptom:** Database queries failing

**Error:** SQL errors or query failures

**Solutions:**
1. **Check Query Syntax:**
   - Review query in logs
   - Verify table/column names
   - Check SQL syntax

2. **Check Permissions:**
   - Verify RLS policies allow operation
   - Check service role has access
   - Review RLS policy configuration

3. **Check Data:**
   - Verify data exists
   - Check foreign key constraints
   - Review data types

**Source:** Query execution in `server/adapters/database/supabase.ts`.

## Migration Issues

### Migration Failures

**Symptom:** Database migrations not applying

**Solutions:**
1. Check migration files in `supabase/migrations/`
2. Verify migration order
3. Check for conflicts
4. Review Supabase migration logs

**Source:** Migration files in `supabase/migrations/`.

## RLS Policy Issues

### Access Denied Errors

**Symptom:** RLS policy blocking access

**Solutions:**
1. **Check RLS Policies:**
   - Review policies in `supabase/migrations/00000000000004_set_permissions.sql`
   - Verify policy conditions
   - Check user role

2. **Service Role Access:**
   - Backend uses service role (bypasses RLS)
   - Verify service role key is used
   - Check key hasn't been changed

**Source:** RLS policies in `supabase/migrations/00000000000004_set_permissions.sql`.

## Performance Issues

### Slow Queries

**Symptom:** Database queries taking too long

**Solutions:**
1. **Check Indexes:**
   - Verify indexes exist
   - Add indexes for frequently queried columns
   - Review query plans

2. **Optimize Queries:**
   - Review query patterns
   - Add pagination
   - Use appropriate filters

3. **Check Database Load:**
   - Review Supabase metrics
   - Check connection pool
   - Consider read replicas

**Source:** Database performance optimization.

## Health Check Issues

### Health Check Failing

**Symptom:** `/api/health/ready` returns not ready

**Solutions:**
1. Check database query in health endpoint
2. Verify database connectivity
3. Review health check logic
4. Check Supabase project status

**Source:** Health check in `server/routes/health.ts` line 12.

## Next Steps

- [Troubleshooting Overview](01-troubleshooting-overview.md) - Troubleshooting guide
- [Common Issues](02-common-issues.md) - Common problems
- [Redis Issues](05-redis-issues.md) - Redis troubleshooting

