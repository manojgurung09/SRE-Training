# Backend Architecture

Express.js backend architecture, middleware stack, and request processing.

## Overview

**Framework:** Express.js 4.18

**Runtime:** Node.js 20+

**Language:** TypeScript 5.5

**Entry Point:** `server/index.ts` → `server/app.ts`

**Source:** Backend entry point in `server/index.ts` and `server/app.ts`.

## Application Structure

### Entry Point

**File:** `server/index.ts`

**Responsibilities:**
- Load environment variables
- Initialize logger
- Start Express server
- Handle graceful shutdown

**Source:** Entry point in `server/index.ts` lines 1-46.

### Express Application

**File:** `server/app.ts`

**Port:** 3000 (configurable via `PORT`)

**CORS Origins:**
- `FRONTEND_URL` environment variable
- `http://localhost:5173` (Vite dev server)
- `http://40.81.230.114:5173`
- `http://localhost:3000`
- `http://40.81.230.114:3000`

**Source:** CORS configuration in `server/app.ts` lines 22-31.

## Middleware Stack

### Middleware Order

1. **CORS Middleware** (`cors`)
   - Handles cross-origin requests
   - Allows credentials

2. **Body Parsers**
   - `express.json()` - JSON body parsing
   - `express.urlencoded()` - URL-encoded body parsing

3. **Metrics Middleware** (`metricsMiddleware`)
   - Collects Prometheus metrics
   - Handles chaos engineering

4. **Logging Middleware** (`logApiEvent`)
   - Logs API requests/responses
   - Tracks request timing

5. **Route Handlers**
   - API routes
   - Health endpoints

6. **Error Handlers**
   - `notFoundHandler` - 404 handler
   - `errorHandler` - Global error handler

**Source:** Middleware order in `server/app.ts` lines 22-73.

## API Routes

### Route Organization

**Base Path:** `/api`

**Routes:**
- `/api/auth` - Authentication (deprecated, returns 410)
- `/api/health` - Health check
- `/api/health/ready` - Readiness check
- `/api/products` - Products CRUD
- `/api/orders` - Orders CRUD
- `/api/payments` - Payments CRUD

**Source:** Route registration in `server/app.ts` lines 44-48.

### Root Endpoint

**Path:** `/`

**Response:** API information and available endpoints

**Source:** Root endpoint in `server/app.ts` lines 50-64.

## Request Processing Flow

### Standard Request Flow

1. **Request Received** → Express server
2. **CORS Check** → CORS middleware
3. **Body Parsing** → JSON/URL-encoded parsers
4. **Metrics Collection** → Metrics middleware
5. **Request Logging** → Logging middleware
6. **Route Matching** → Route handlers
7. **Business Logic** → Route handler logic
8. **Response** → JSON response
9. **Error Handling** → Error handler (if error)

**Source:** Request flow derived from middleware order.

## Middleware Details

### Metrics Middleware

**File:** `server/middleware/metricsMiddleware.ts`

**Functions:**
- HTTP request duration tracking
- HTTP request count tracking
- Chaos engineering latency injection

**Source:** Metrics middleware in `server/middleware/metricsMiddleware.ts`.

### Logging Middleware

**File:** `server/middleware/logger.ts`

**Functions:**
- Request/response logging
- Timing information
- Cold start detection
- Async Supabase logging

**Source:** Logging middleware in `server/middleware/logger.ts`.

### Error Handler

**File:** `server/middleware/errorHandler.ts`

**Functions:**
- Global error handling
- Error logging
- Error metrics (5xx responses)

**Source:** Error handler in `server/middleware/errorHandler.ts`.

### Cache Middleware

**File:** `server/middleware/cache.ts`

**Functions:**
- GET request caching
- Cache hit/miss tracking
- Cache invalidation

**Source:** Cache middleware in `server/middleware/cache.ts`.

## Configuration

### Environment Variables

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional:**
- `PORT` (default: 3000)
- `FRONTEND_URL` (default: http://localhost:5173)
- `NODE_ENV` (default: development)

**Source:** Environment variable usage throughout configuration files.

### Deployment Configuration

**File:** `server/config/deployment.ts`

**Configuration:**
- Deployment mode (single-vm, multi-tier, kubernetes)
- Database type
- Worker mode
- Cache type
- Secrets provider

**Source:** Deployment configuration in `server/config/deployment.ts`.

## Error Handling

### Error Types

1. **Route Not Found** → 404 response
2. **Validation Errors** → 400 response
3. **Database Errors** → 500 response
4. **Unknown Errors** → 500 response

**Source:** Error handling in `server/middleware/errorHandler.ts`.

### Error Response Format

```json
{
  "error": "Error message",
  "statusCode": 500
}
```

**Source:** Error response format in `server/middleware/errorHandler.ts`.

## Health Checks

### Liveness Probe

**Endpoint:** `GET /api/health`

**Purpose:** Check if service is running

**Response:** `{ status: 'ok' }`

**Source:** Health endpoint in `server/routes/health.ts` line 5.

### Readiness Probe

**Endpoint:** `GET /api/health/ready`

**Purpose:** Check if service is ready to serve traffic

**Response:** `{ status: 'ready' }` (after database check)

**Source:** Readiness endpoint in `server/routes/health.ts` line 12.

## Metrics Endpoint

### Prometheus Metrics

**Endpoint:** `GET /metrics`

**Content-Type:** `text/plain; version=0.0.4; charset=utf-8`

**Format:** Prometheus text format

**Source:** Metrics endpoint in `server/app.ts` lines 39-42.

## Testing Endpoint

### Test Log Endpoint

**Endpoint:** `GET /api/test-log`

**Purpose:** Verify logging functionality

**Response:** `{ message: 'Check logs/api.log for this entry', timestamp: '...' }`

**Source:** Test log endpoint in `server/app.ts` lines 67-70.

## Training vs Production

### Training Mode

**Features:**
- Detailed logging
- Full metrics
- Chaos engineering enabled
- Relaxed error handling

**Use Case:** SRE training, development

### Production Mode

**Features:**
- Production logging levels
- Essential metrics only
- Chaos engineering disabled
- Strict error handling

**Use Case:** Production deployment

**Source:** Mode differences based on `NODE_ENV` and configuration.

## Next Steps

- [System Architecture](01-system-architecture.md) - Overall system architecture
- [Frontend Architecture](03-frontend-architecture.md) - React frontend details
- [Database Architecture](04-database-architecture.md) - Database layer
- [Cache Architecture](05-cache-architecture.md) - Caching layer
- [Worker Architecture](06-worker-architecture.md) - Background workers

