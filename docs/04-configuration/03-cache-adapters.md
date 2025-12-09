# Cache Adapters

Cache adapter configuration, switching, and performance tuning.

## Adapter Overview

**Pattern:** Adapter pattern for cache abstraction

**Location:** `server/adapters/cache/`

**Selection:** Via `CACHE_TYPE` environment variable

**Source:** Cache adapter selection in `server/adapters/cache/index.ts` lines 13-26.

## Available Adapters

### Memory Adapter

**File:** `server/adapters/cache/memory.ts`

**Default:** Yes (default adapter)

**Behavior:**
- In-process memory cache
- TTL-based expiration
- Automatic cleanup every 60 seconds
- No persistence across restarts

**Source:** Memory adapter in `server/adapters/cache/memory.ts`.

### Redis Adapter

**File:** `server/adapters/cache/redis.ts`

**Configuration:**
- `CACHE_REDIS_URL` - Redis connection URL
- `OCI_CACHE_ENDPOINT` - OCI Cache endpoint (alternative)

**Behavior:**
- Persistent cache across restarts
- TTL-based expiration
- Shared across multiple instances
- Metrics integration (latency tracking)

**Source:** Redis adapter in `server/adapters/cache/redis.ts`.

## Switching Adapters

### Switch to Memory (Default)

```bash
CACHE_TYPE=memory
```

**Source:** Default configuration in `server/config/deployment.ts` line 27.

### Switch to Redis

```bash
CACHE_TYPE=redis
CACHE_REDIS_URL=redis://localhost:6379
```

**Source:** Redis adapter configuration in `server/adapters/cache/redis.ts` line 9.

## Adapter Interface

### ICacheAdapter Interface

```typescript
interface ICacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}
```

**Source:** Interface definition in `server/adapters/cache/index.ts` lines 5-11.

## Cache Usage

### Product List Caching

**TTL:** 300 seconds (5 minutes)

**Cache Key:** `products:GET:/api/products?category=electronics&limit=50&offset=0`

**Source:** Cache configuration in `server/routes/products.ts` line 7.

### Product Detail Caching

**TTL:** 600 seconds (10 minutes)

**Cache Key:** `product:GET:/api/products/:id`

**Source:** Cache configuration in `server/routes/products.ts` line 42.

### Order List Caching

**TTL:** 60 seconds (1 minute)

**Cache Key:** `orders:GET:/api/orders?status=pending&limit=50&offset=0`

**Source:** Cache configuration in `server/routes/orders.ts` line 10.

### Order Detail Caching

**TTL:** 120 seconds (2 minutes)

**Cache Key:** `order:GET:/api/orders/:id`

**Source:** Cache configuration in `server/routes/orders.ts` line 45.

## Cache Invalidation

### Automatic Invalidation

Cache is automatically invalidated on:
- Product creation (`POST /api/products`)
- Product update (`PUT /api/products/:id`)
- Product deletion (`DELETE /api/products/:id`)
- Order creation (`POST /api/orders`)
- Order status update (`PATCH /api/orders/:id/status`)

**Source:** Cache invalidation in route handlers (e.g., `server/routes/products.ts` line 88).

### Invalidation Patterns

**Pattern-Based:**
- `products:*` - All product list caches
- `product:*:${id}` - Specific product cache
- `orders:*` - All order list caches
- `order:*:${id}` - Specific order cache

**Source:** Cache invalidation patterns in route handlers.

## TTL Configuration

### Default TTLs

- **Product List:** 300 seconds
- **Product Detail:** 600 seconds
- **Order List:** 60 seconds
- **Order Detail:** 120 seconds

**Source:** TTL values in route handlers.

### Custom TTL

TTL can be configured per route:

```typescript
cacheMiddleware({ ttl: 600, keyPrefix: 'product' })
```

**Source:** Cache middleware configuration in `server/middleware/cache.ts` lines 11-16.

## Performance Tuning

### Memory Adapter

**Limitations:**
- Limited by available memory
- No persistence
- Single instance only

**Optimization:**
- Adjust cleanup interval (default: 60 seconds)
- Monitor memory usage

**Source:** Memory adapter implementation in `server/adapters/cache/memory.ts`.

### Redis Adapter

**Advantages:**
- Shared across instances
- Persistent storage
- High performance

**Optimization:**
- Connection pooling
- Redis cluster for high availability
- Memory limits and eviction policies

**Source:** Redis adapter in `server/adapters/cache/redis.ts`.

## Metrics Integration

### Cache Latency

**Metric:** `external_call_latency_ms{dependency="redis"}`

**Tracked:** All Redis cache operations

**Source:** Latency tracking in `server/adapters/cache/redis.ts` lines 34, 58, 65, 72, 79.

### Retry Attempts

**Metric:** `retry_attempts_total{dependency="redis"}`

**Tracked:** Redis connection retries

**Source:** Retry tracking in `server/adapters/cache/redis.ts` line 16.

## Training vs Production

### Training Mode

**Default:** Memory adapter (no dependencies)

**Use Case:** Learning, development

### Production Mode

**Recommended:** Redis adapter

**Use Case:** High performance, shared cache, persistence

**Source:** Adapter selection based on deployment requirements.

## Next Steps

- [Environment Variables](01-environment-variables.md) - Complete environment variable reference
- [Database Adapters](02-database-adapters.md) - Database adapter configuration
- [Worker Adapters](04-worker-adapters.md) - Worker adapter configuration

