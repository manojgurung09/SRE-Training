# Cache Architecture

Caching strategy, cache adapters, and cache invalidation.

## Overview

**Default Cache:** Memory (in-process)

**Adapter Pattern:** Multiple cache adapters supported

**Cache Middleware:** `server/middleware/cache.ts`

**Source:** Cache configuration in `server/config/deployment.ts` line 27.

## Cache Adapters

### Memory Adapter

**File:** `server/adapters/cache/memory.ts`

**Default:** Yes

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

## Cache Middleware

### Middleware Function

**File:** `server/middleware/cache.ts`

**Function:** `cacheMiddleware(options)`

**Options:**
- `ttl` - Time to live in seconds (default: 300)
- `keyPrefix` - Cache key prefix (default: 'api')
- `generateKey` - Custom key generation function

**Source:** Cache middleware in `server/middleware/cache.ts` lines 11-52.

### Cache Key Generation

**Default Format:** `${keyPrefix}:${method}:${originalUrl}`

**Example:** `products:GET:/api/products?category=electronics&limit=50&offset=0`

**Source:** Key generation in `server/middleware/cache.ts` line 15.

## Cache Usage

### Product List Caching

**Route:** `GET /api/products`

**TTL:** 300 seconds (5 minutes)

**Cache Key:** `products:GET:/api/products?category=electronics&limit=50&offset=0`

**Source:** Product list caching in `server/routes/products.ts` line 7.

### Product Detail Caching

**Route:** `GET /api/products/:id`

**TTL:** 600 seconds (10 minutes)

**Cache Key:** `product:GET:/api/products/:id`

**Source:** Product detail caching in `server/routes/products.ts` line 42.

### Order List Caching

**Route:** `GET /api/orders`

**TTL:** 60 seconds (1 minute)

**Cache Key:** `orders:GET:/api/orders?status=pending&limit=50&offset=0`

**Source:** Order list caching in `server/routes/orders.ts` line 10.

### Order Detail Caching

**Route:** `GET /api/orders/:id`

**TTL:** 120 seconds (2 minutes)

**Cache Key:** `order:GET:/api/orders/:id`

**Source:** Order detail caching in `server/routes/orders.ts` line 45.

## Cache Invalidation

### Invalidation Function

**File:** `server/middleware/cache.ts`

**Function:** `invalidateCache(pattern)`

**Purpose:** Invalidate cache keys matching a pattern

**Source:** Invalidation function in `server/middleware/cache.ts` lines 54-63.

### Automatic Invalidation

**Product Operations:**
- `POST /api/products` → Invalidate `products:*`
- `PUT /api/products/:id` → Invalidate `products:*` and `product:*:${id}`
- `DELETE /api/products/:id` → Invalidate `products:*` and `product:*:${id}`

**Source:** Product cache invalidation in `server/routes/products.ts` line 88.

**Order Operations:**
- `POST /api/orders` → Invalidate `orders:*`
- `PATCH /api/orders/:id/status` → Invalidate `orders:*` and `order:*:${id}`

**Source:** Order cache invalidation in `server/routes/orders.ts` line 161.

## Cache Headers

### Response Headers

**X-Cache Header:**
- `HIT` - Response served from cache
- `MISS` - Response fetched from database

**Source:** Cache headers in `server/middleware/cache.ts` lines 30, 35.

## Cache Statistics

### Memory Adapter

**Statistics:**
- Cache size (number of entries)
- Expired entries (cleaned up)

**Source:** Memory adapter tracks cache entries.

### Redis Adapter

**Statistics:**
- Cache operations (get, set, delete)
- Latency metrics (`external_call_latency_ms{dependency="redis"}`)
- Retry attempts (`retry_attempts_total{dependency="redis"}`)

**Source:** Redis adapter metrics in `server/adapters/cache/redis.ts`.

## Cache Performance

### Memory Adapter

**Advantages:**
- Zero latency (in-process)
- No network overhead
- Simple setup

**Limitations:**
- Limited by available memory
- No persistence
- Single instance only

**Source:** Memory adapter characteristics.

### Redis Adapter

**Advantages:**
- Shared across instances
- Persistent storage
- High performance
- Scalable

**Limitations:**
- Network latency
- Requires Redis infrastructure

**Source:** Redis adapter characteristics.

## Cache Warming

### Current Status

**Not Implemented:** No automatic cache warming

**⚠️ Production Recommendation:** Implement cache warming for frequently accessed data

**Source:** No cache warming implementation found.

## Training vs Production

### Training Mode

**Default:** Memory adapter (no dependencies)

**Use Case:** Learning, development

### Production Mode

**Recommended:** Redis adapter

**Use Case:** High performance, shared cache, persistence

**Source:** Cache adapter selection via `CACHE_TYPE` environment variable.

## Next Steps

- [System Architecture](01-system-architecture.md) - Overall system architecture
- [Cache Adapters](../04-configuration/03-cache-adapters.md) - Adapter configuration
- [Configuration: Environment Variables](../04-configuration/01-environment-variables.md) - Cache configuration

