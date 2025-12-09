# Worker Adapters

Worker adapter configuration, queue setup, and scaling.

## Adapter Overview

**Pattern:** Adapter pattern for worker abstraction

**Location:** `server/adapters/workers/`

**Selection:** Via `WORKER_MODE` environment variable

**Source:** Worker adapter selection in `server/adapters/workers/index.ts` lines 18-32.

## Available Adapters

### In-Process Adapter

**File:** `server/adapters/workers/in-process.ts`

**Default:** Yes (default adapter)

**Behavior:**
- Jobs execute immediately and synchronously
- No queue persistence
- No retry mechanism
- Simple statistics tracking

**Source:** In-process adapter in `server/adapters/workers/in-process.ts`.

### Bull Queue Adapter

**File:** `server/adapters/workers/bull-queue.ts`

**Configuration:**
- `QUEUE_REDIS_URL` - Redis connection URL for queue

**Behavior:**
- Jobs queued in Redis
- Asynchronous processing
- Automatic retry with backoff
- Job persistence across restarts

**Source:** Bull queue adapter in `server/adapters/workers/bull-queue.ts`.

### No-Op Adapter

**File:** `server/adapters/workers/noop.ts`

**Behavior:**
- Jobs are ignored (no processing)
- Returns empty statistics

**Use Case:** Testing, minimal deployments

**Source:** No-op adapter in `server/adapters/workers/noop.ts`.

## Switching Adapters

### Switch to In-Process (Default)

```bash
WORKER_MODE=in-process
```

**Source:** Default configuration in `server/config/deployment.ts` line 26.

### Switch to Bull Queue

```bash
WORKER_MODE=bull-queue
QUEUE_REDIS_URL=redis://localhost:6379
```

**Source:** Bull queue configuration in `server/config/queue.ts` line 4.

### Disable Workers

```bash
WORKER_MODE=none
```

**Source:** Worker mode selection in `server/adapters/workers/index.ts` line 27.

## Queue Configuration

### Order Queue

**Queue Name:** `order-processing`

**Configuration:**
- Attempts: 3
- Backoff: Exponential (2000ms base)
- Remove on complete: 100 jobs
- Remove on fail: 50 jobs

**Source:** Order queue configuration in `server/config/queue.ts` lines 44-54.

### Email Queue

**Queue Name:** `email-notifications`

**Configuration:**
- Attempts: 5
- Backoff: Exponential (1000ms base)
- Remove on complete: 50 jobs
- Remove on fail: 25 jobs

**Source:** Email queue configuration in `server/config/queue.ts` lines 56-66.

### Payment Queue

**Queue Name:** `payment-processing`

**Configuration:**
- Attempts: 3
- Backoff: Fixed (5000ms)
- Remove on complete: 100 jobs
- Remove on fail: 50 jobs

**Source:** Payment queue configuration in `server/config/queue.ts` lines 68-78.

## Worker Scaling

### Concurrency Configuration

**Environment Variable:** `WORKER_CONCURRENCY`

**Default:** 5

**Purpose:** Number of concurrent jobs per worker

**Example:**
```bash
WORKER_CONCURRENCY=10
```

**Source:** Worker concurrency in `server/adapters/workers/bull-queue.ts` line 41.

### Horizontal Scaling

**Strategy:** Run multiple worker instances

**Configuration:**
- Set `WORKER_TYPE` to specific worker type
- Run multiple instances with different `WORKER_TYPE` values
- All instances connect to same Redis queue

**Source:** Worker type selection in `server/workers/index.ts` lines 6-44.

## Queue Statistics

### Queue Stats Function

**Location:** `server/config/queue.ts`

**Function:** `queueService.getQueueStats()`

**Returns:**
```typescript
{
  orders: { waiting, active, completed, failed, delayed, paused },
  emails: { waiting, active, completed, failed, delayed, paused },
  payments: { waiting, active, completed, failed, delayed, paused }
}
```

**Source:** Queue stats in `server/config/queue.ts` lines 147-169.

## Retry Configuration

### Exponential Backoff

**Order Jobs:**
- Base delay: 2000ms
- Multiplier: Exponential
- Max attempts: 3

**Email Jobs:**
- Base delay: 1000ms
- Multiplier: Exponential
- Max attempts: 5

**Source:** Retry configuration in `server/config/queue.ts` lines 44-66.

### Fixed Backoff

**Payment Jobs:**
- Delay: 5000ms (fixed)
- Max attempts: 3

**Source:** Payment queue configuration in `server/config/queue.ts` lines 68-78.

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
- Payment gateway integration
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

**Source:** Worker entry point in `server/workers/index.ts` lines 6-44.

## Training vs Production

### Training Mode

**Default:** In-process workers (synchronous)

**Use Case:** Learning worker concepts, simple testing

### Production Mode

**Recommended:** Bull Queue with Redis

**Use Case:** High-volume processing, reliability, scalability

**Source:** Worker mode selection via `WORKER_MODE` environment variable.

## Next Steps

- [Environment Variables](01-environment-variables.md) - Complete environment variable reference
- [Database Adapters](02-database-adapters.md) - Database adapter configuration
- [Cache Adapters](03-cache-adapters.md) - Cache adapter configuration
- [Worker Reliability Model](../02-architecture/08-worker-reliability-model.md) - Reliability semantics

