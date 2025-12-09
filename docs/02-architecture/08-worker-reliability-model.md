# Worker Reliability Model

Reliability semantics, retry behavior, and failure recovery for background workers.

## Reliability Guarantees

### At-Least-Once Delivery

**Guarantee:** Jobs are delivered at least once (may be delivered multiple times)

**Implementation:** Bull Queue with Redis persistence

**Source:** Bull Queue configuration in `server/config/queue.ts` lines 44-78.

### Job Processing Guarantees

**In-Process Mode:**
- **Delivery:** Immediate (synchronous)
- **Retry:** No automatic retry
- **Failure:** Fails immediately if error occurs

**Source:** In-process adapter in `server/adapters/workers/in-process.ts` lines 12-35.

**Bull Queue Mode:**
- **Delivery:** Asynchronous via Redis queue
- **Retry:** Automatic retry with backoff
- **Failure:** Retries up to max attempts, then fails

**Source:** Bull queue configuration in `server/config/queue.ts` lines 44-78.

## Retry Behavior

### Order Processing Jobs

**Max Attempts:** 3

**Backoff Strategy:** Exponential

**Backoff Delays:** 2000ms, 4000ms, 8000ms

**Source:** Order queue configuration in `server/config/queue.ts` lines 44-54.

### Email Notification Jobs

**Max Attempts:** 5

**Backoff Strategy:** Exponential

**Backoff Delays:** 1000ms, 2000ms, 4000ms, 8000ms, 16000ms

**Source:** Email queue configuration in `server/config/queue.ts` lines 56-66.

### Payment Processing Jobs

**Max Attempts:** 3

**Backoff Strategy:** Fixed

**Backoff Delay:** 5000ms (between all attempts)

**Source:** Payment queue configuration in `server/config/queue.ts` lines 68-78.

## Failure Recovery

### Job Failure States

1. **Active:** Job is being processed
2. **Failed:** Job failed after max attempts
3. **Completed:** Job completed successfully
4. **Delayed:** Job scheduled for future execution

**Source:** Bull Queue job states.

### Failed Job Handling

**Storage:** Failed jobs are kept for analysis

**Retention:**
- Order jobs: 50 failed jobs retained
- Email jobs: 25 failed jobs retained
- Payment jobs: 50 failed jobs retained

**Source:** Failed job retention in `server/config/queue.ts` lines 52, 64, 76.

### Manual Retry

Failed jobs can be manually retried via:
- Bull Queue dashboard
- Queue management API (if implemented)
- Direct Redis operations

**Source:** Bull Queue supports manual job retry.

## Idempotency

### Idempotent Operations

**Order Processing:**
- Stock checks are idempotent
- Status updates are idempotent (can be applied multiple times)

**Payment Processing:**
- Payment status updates are idempotent
- Order status updates are idempotent

**Source:** Idempotency patterns in worker implementations.

### Non-Idempotent Operations

**Email Notifications:**
- Sending emails is not idempotent
- Multiple sends may result in duplicate emails

**⚠️ Production Note:** Implement idempotency keys for email notifications in production.

**Source:** Email worker in `server/workers/emailWorker.ts`.

## Error Handling

### Error Types

1. **Transient Errors:** Network issues, temporary database unavailability
   - **Handling:** Automatic retry with backoff

2. **Permanent Errors:** Invalid data, business logic errors
   - **Handling:** Job fails after max attempts

**Source:** Error handling in worker implementations.

### Error Logging

**All errors are logged via Winston:**
- Error message
- Stack trace
- Job context
- Retry attempt number

**Source:** Error logging in worker implementations (e.g., `server/workers/orderWorker.ts` line 69).

## Dead Letter Queue

**Current Status:** Not implemented

**⚠️ Production Recommendation:** Implement dead letter queue for permanently failed jobs

**Source:** No dead letter queue implementation found.

## Monitoring

### Queue Metrics

**Available Metrics:**
- Queue depth (waiting jobs)
- Active jobs
- Completed jobs
- Failed jobs
- Processing time

**Source:** Queue stats function in `server/config/queue.ts` lines 147-169.

### Worker Health

**Health Indicators:**
- Worker process running
- Redis connection active
- Jobs being processed
- No excessive failures

**Source:** Worker health can be monitored via process status and queue metrics.

## Reliability Semantics by Mode

### In-Process Mode

**Reliability:** Best-effort (no persistence)

**Guarantees:**
- Jobs execute immediately
- No retry on failure
- No persistence across restarts

**Use Case:** Development, simple deployments

**Source:** In-process adapter behavior in `server/adapters/workers/in-process.ts`.

### Bull Queue Mode

**Reliability:** At-least-once delivery

**Guarantees:**
- Jobs persisted in Redis
- Automatic retry on failure
- Survives worker restarts
- Configurable retry strategy

**Use Case:** Production deployments

**Source:** Bull queue configuration in `server/config/queue.ts`.

## Failure Scenarios

### Worker Process Crash

**In-Process Mode:** Jobs in progress are lost

**Bull Queue Mode:** Jobs are requeued and retried by other workers

**Source:** Bull Queue provides job persistence.

### Redis Failure

**Impact:** Queue operations fail

**Recovery:** Jobs are lost if Redis is unavailable

**⚠️ Production Note:** Use Redis high availability (HA) or cluster mode

**Source:** Redis is required for Bull Queue mode.

### Database Failure

**Impact:** Jobs that require database access fail

**Recovery:** Automatic retry when database recovers

**Source:** Retry mechanism handles transient database failures.

## Best Practices

1. **Idempotent Operations:** Design jobs to be idempotent
2. **Error Handling:** Handle both transient and permanent errors
3. **Monitoring:** Monitor queue depth and failure rates
4. **Alerting:** Alert on high failure rates or queue backup
5. **Retry Strategy:** Use appropriate backoff for different job types

**Source:** Best practices based on worker implementation patterns.

## Training vs Production

### Training Mode

**Focus:** Understanding reliability concepts

**Use Case:** Learning retry behavior, failure scenarios

### Production Mode

**Focus:** Ensuring job delivery and processing

**Use Case:** Reliable background processing, error recovery

**Source:** Reliability model applies to both training and production.

