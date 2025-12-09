# Worker Issues

Troubleshooting guide for worker-related problems.

## Worker Not Processing Jobs

### Jobs Not Processing

**Symptom:** Queue backing up, jobs not being processed

**Solutions:**
1. **Check Worker Mode:**
   - Verify `WORKER_MODE=bull-queue` (not `in-process`)
   - Default is `in-process` (synchronous)

2. **Check Workers Running:**
   - Verify worker processes are running
   - Check `WORKER_TYPE` environment variable
   - Review worker logs

3. **Check Queue Connection:**
   - Verify `QUEUE_REDIS_URL` is set
   - Check Redis connection
   - Test queue Redis accessibility

**Source:** Worker configuration in `server/config/deployment.ts` line 26.

### Worker Process Crashed

**Symptom:** Workers not running, jobs stuck

**Solutions:**
1. **Check Worker Logs:**
   - Review error logs
   - Check for crashes
   - Identify error causes

2. **Restart Workers:**
   - Restart worker processes
   - Use PM2 or systemd for auto-restart
   - Verify workers start successfully

3. **Check Dependencies:**
   - Verify database connectivity
   - Check Redis connection
   - Review environment variables

**Source:** Worker process management.

## Queue Issues

### Queue Backing Up

**Symptom:** Queue depth increasing, jobs not processing fast enough

**Solutions:**
1. **Scale Workers:**
   - Increase worker replicas
   - Adjust `WORKER_CONCURRENCY`
   - Add more worker instances

2. **Check Worker Performance:**
   - Review worker processing time
   - Identify slow jobs
   - Optimize job processing

3. **Check Queue Configuration:**
   - Review queue settings
   - Check retry configuration
   - Verify job options

**Source:** Queue configuration in `server/config/queue.ts` lines 44-78.

### Jobs Failing

**Symptom:** High job failure rate

**Solutions:**
1. **Check Job Logs:**
   - Review failed job logs
   - Identify failure patterns
   - Check error messages

2. **Review Retry Configuration:**
   - Check retry attempts
   - Review backoff strategy
   - Adjust retry settings

3. **Check Dependencies:**
   - Verify database connectivity
   - Check external service availability
   - Review job data validity

**Source:** Job failure handling in `server/config/queue.ts`.

## Worker Type Issues

### Wrong Worker Type

**Symptom:** Jobs not processed by expected worker

**Solutions:**
1. **Check WORKER_TYPE:**
   - Verify `WORKER_TYPE` environment variable
   - Options: `email`, `order`, `payment`, `all`
   - Restart workers with correct type

2. **Check Worker Selection:**
   - Review worker entry point
   - Verify worker type logic
   - Check worker registration

**Source:** Worker type in `server/workers/index.ts` lines 6-44.

## Performance Issues

### Slow Job Processing

**Symptom:** Jobs taking too long to process

**Solutions:**
1. **Optimize Job Logic:**
   - Review job processing code
   - Identify bottlenecks
   - Optimize database queries

2. **Adjust Concurrency:**
   - Increase `WORKER_CONCURRENCY`
   - Balance concurrency vs resources
   - Monitor worker performance

3. **Check Dependencies:**
   - Review external service latency
   - Check database performance
   - Optimize network calls

**Source:** Worker performance optimization.

## Next Steps

- [Troubleshooting Overview](01-troubleshooting-overview.md) - Troubleshooting guide
- [Observability Issues](07-observability-issues.md) - Observability troubleshooting
- [Common Issues](02-common-issues.md) - Common problems

