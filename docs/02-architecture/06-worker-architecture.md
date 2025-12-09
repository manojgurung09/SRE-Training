# Worker Architecture

Background job processing architecture and worker types.

## Overview

**Purpose:** Asynchronous processing of time-consuming tasks

**Worker Types:**
- Email notifications
- Order processing
- Payment processing

**Source:** Worker implementations in `server/workers/` directory.

## Worker Adapters

### In-Process Adapter

**Implementation:** `server/adapters/workers/in-process.ts`

**Behavior:** Jobs execute immediately and synchronously

**Use Case:** Development, simple deployments

**Source:** In-process adapter in `server/adapters/workers/in-process.ts`.

### Bull Queue Adapter

**Implementation:** `server/adapters/workers/bull-queue.ts`

**Behavior:** Jobs queued in Redis and processed asynchronously

**Requirements:** Redis connection (`QUEUE_REDIS_URL`)

**Use Case:** Production deployments with high volume

**Source:** Bull queue adapter in `server/adapters/workers/bull-queue.ts`.

### No-Op Adapter

**Implementation:** `server/adapters/workers/noop.ts`

**Behavior:** Jobs are ignored (no processing)

**Use Case:** Testing, minimal deployments

**Source:** No-op adapter in `server/adapters/workers/noop.ts`.

## Worker Selection

**Configuration:** `WORKER_MODE` environment variable

**Options:**
- `in-process` - Synchronous processing (default)
- `bull-queue` - Bull Queue with Redis
- `none` - No processing

**Source:** Worker adapter selection in `server/adapters/workers/index.ts` lines 18-32.

## Worker Types

### Email Worker

**File:** `server/workers/emailWorker.ts`

**Purpose:** Send email notifications

**Job Types:**
- Order confirmation
- Payment success
- Payment failed

**Source:** Email worker in `server/workers/emailWorker.ts`.

### Order Worker

**File:** `server/workers/orderWorker.ts`

**Purpose:** Process orders

**Tasks:**
- Stock validation
- Inventory updates
- Order status updates
- Email notifications

**Source:** Order worker in `server/workers/orderWorker.ts`.

### Payment Worker

**File:** `server/workers/paymentWorker.ts`

**Purpose:** Process payments

**Tasks:**
- Payment gateway integration (simulated)
- Payment status updates
- Order status updates
- Email notifications

**Source:** Payment worker in `server/workers/paymentWorker.ts`.

## Worker Entry Point

**File:** `server/workers/index.ts`

**Configuration:** `WORKER_TYPE` environment variable

**Options:**
- `email` - Email worker only
- `order` - Order worker only
- `payment` - Payment worker only
- `all` - All workers (default)

**Source:** Worker entry point in `server/workers/index.ts` lines 6-51.

## Queue Configuration

### Bull Queue Settings

**Order Queue:**
- Attempts: 3
- Backoff: Exponential (2000ms base)
- Remove on complete: 100 jobs
- Remove on fail: 50 jobs

**Email Queue:**
- Attempts: 5
- Backoff: Exponential (1000ms base)
- Remove on complete: 50 jobs
- Remove on fail: 25 jobs

**Payment Queue:**
- Attempts: 3
- Backoff: Fixed (5000ms)
- Remove on complete: 100 jobs
- Remove on fail: 50 jobs

**Source:** Queue configuration in `server/config/queue.ts` lines 44-78.

## Job Processing Flow

### Order Processing

1. **Job Added** → Order queue
2. **Worker Picks Up** → Order worker
3. **Stock Check** → Validate product availability
4. **Inventory Update** → Update stock quantities
5. **Status Update** → Order status to "processing"
6. **Email Notification** → Order confirmation email

**Source:** Order processing in `server/workers/orderWorker.ts` lines 10-72.

### Payment Processing

1. **Job Added** → Payment queue
2. **Worker Picks Up** → Payment worker
3. **Payment Gateway** → Process payment (simulated)
4. **Status Update** → Payment and order status
5. **Email Notification** → Payment confirmation/failure email

**Source:** Payment processing in `server/workers/paymentWorker.ts` lines 10-108.

## Retry Behavior

### Retry Configuration

**Order Jobs:**
- Max attempts: 3
- Backoff: Exponential (2s, 4s, 8s)

**Email Jobs:**
- Max attempts: 5
- Backoff: Exponential (1s, 2s, 4s, 8s, 16s)

**Payment Jobs:**
- Max attempts: 3
- Backoff: Fixed (5s between attempts)

**Source:** Retry configuration in `server/config/queue.ts` lines 44-78.

## Failure Recovery

### Job Failure Handling

1. **Job Fails** → Retry according to backoff strategy
2. **Max Attempts Reached** → Job marked as failed
3. **Failed Job Storage** → Kept for analysis (configurable count)
4. **Error Logging** → Errors logged via Winston

**Source:** Failure handling in queue configuration and worker implementations.

## Queue Statistics

### Queue Stats Endpoint

**Endpoint:** `GET /api/queues/stats` (if implemented)

**Metrics:**
- Waiting jobs
- Active jobs
- Completed jobs
- Failed jobs

**Source:** Queue stats function in `server/config/queue.ts` lines 147-169.

## Monitoring Workers

### Metrics

Workers can expose metrics for:
- Jobs processed
- Jobs failed
- Processing time
- Queue depth

**Source:** Worker metrics can be added to Prometheus registry.

### Logging

Workers log:
- Job start/completion
- Job failures
- Processing progress

**Source:** Worker logging in worker implementations.

## Scaling Workers

### Horizontal Scaling

**Strategy:** Run multiple worker instances

**Configuration:** `WORKER_CONCURRENCY` environment variable

**Default:** 5 concurrent jobs per worker

**Source:** Concurrency configuration in `server/adapters/workers/bull-queue.ts` line 41.

### Vertical Scaling

**Strategy:** Increase worker concurrency

**Configuration:** Adjust `WORKER_CONCURRENCY` value

## Training vs Production

### Training Mode

**Default:** In-process workers (synchronous)

**Use Case:** Learning worker concepts, simple testing

### Production Mode

**Recommended:** Bull Queue with Redis

**Use Case:** High-volume processing, reliability, scalability

**Source:** Worker mode selection via `WORKER_MODE` environment variable.

## Next Steps

- [Worker Reliability Model](08-worker-reliability-model.md) - Reliability semantics and guarantees
- [Configuration: Worker Adapters](../04-configuration/04-worker-adapters.md) - Worker configuration
- [Deployment: Workers](../05-deployment/) - Worker deployment guides

