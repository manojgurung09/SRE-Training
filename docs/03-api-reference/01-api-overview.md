# API Overview

Complete REST API reference for the BharatMart e-commerce platform.

## Base URLs

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://api.yourdomain.com
```

**Source:** Server port configuration in `server/index.ts` line 10. Default port is 3000, configurable via `PORT` environment variable.

## Authentication Methods

### Supabase Auth (Frontend)

The frontend uses Supabase Auth for user authentication. Users authenticate via the React frontend, and the backend validates requests using Supabase service role key.

**Source:** Frontend authentication in `src/contexts/AuthContext.tsx`. Backend uses Supabase service role key in `server/config/supabase.ts` lines 42-51.

### API Authentication (Backend)

**Current Status:** Backend API routes do not require authentication tokens. Authentication is handled at the database level via Row Level Security (RLS).

**⚠️ Training Mode:** Authentication is relaxed for training purposes. In production, implement proper API authentication.

**Source:** Auth routes in `server/routes/auth.ts` return 410 (Gone) status, indicating SQLite auth was removed. No authentication middleware is applied to API routes in `server/app.ts`.

## Request/Response Formats

### Request Format

All requests use JSON format:

```bash
Content-Type: application/json
```

**Source:** JSON body parsing configured in `server/app.ts` line 33.

### Response Format

**Success Response:**
```json
{
  "data": [...],
  "count": 10,
  "limit": 50,
  "offset": 0
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

**Source:** Response format examples from `server/routes/products.ts` lines 30-35 and error handling in `server/middleware/errorHandler.ts` lines 16-23.

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service not ready |

**Source:** Status codes used throughout route handlers in `server/routes/`.

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "message": "Error description",
    "status": 500,
    "path": "/api/products",
    "timestamp": "2024-12-19T10:00:00.000Z"
  }
}
```

**Source:** Error format defined in `server/middleware/errorHandler.ts` lines 16-23.

## Rate Limiting

**Current Status:** Rate limiting is not implemented.

**⚠️ Production Note:** Implement rate limiting before production deployment.

**Source:** No rate limiting middleware found in `server/app.ts` or `server/middleware/`.

## API Versioning

**Current Status:** API versioning is not implemented. All endpoints are under `/api/`.

**Source:** Route registration in `server/app.ts` lines 44-48 shows all routes under `/api/` prefix.

## Available Endpoints

### Health & Status

- `GET /api/health` - Health check (liveness probe)
- `GET /api/health/ready` - Readiness probe
- `GET /api/system/info` - Comprehensive system information
- `GET /metrics` - Prometheus metrics

**Source:** Health routes in `server/routes/health.ts`. System info route in `server/routes/system.ts`. Metrics endpoint in `server/app.ts` line 39.

### Products

- `GET /api/products` - List products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Source:** Product routes in `server/routes/products.ts`.

### Orders

- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

**Source:** Order routes in `server/routes/orders.ts`.

### Payments

- `GET /api/payments` - List payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment
- `PATCH /api/payments/:id/status` - Update payment status

**Source:** Payment routes in `server/routes/payments.ts`.

## CORS Configuration

CORS is configured to allow requests from:

- `FRONTEND_URL` environment variable
- `http://localhost:5173` (default Vite dev server)
- `http://40.81.230.114:5173`
- `http://localhost:3000`
- `http://40.81.230.114:3000`

**Source:** CORS configuration in `server/app.ts` lines 22-31.

## Response Caching

GET requests to products and orders endpoints are cached:

- **Products List:** 300 seconds TTL
- **Product Detail:** 600 seconds TTL
- **Orders List:** 60 seconds TTL
- **Order Detail:** 120 seconds TTL

Cache is invalidated on POST, PUT, DELETE operations.

**Source:** Cache middleware configuration in `server/routes/products.ts` lines 7, 42 and `server/routes/orders.ts` lines 10, 45.

## Metrics

All API requests are automatically instrumented with Prometheus metrics:

- `http_requests_total` - Total request count
- `http_request_duration_seconds` - Request duration histogram

**Source:** Metrics middleware in `server/middleware/metricsMiddleware.ts` lines 24-37.

## Next Steps

- [Products API](03-products-api.md) - Complete Products API reference
- [Orders API](04-orders-api.md) - Complete Orders API reference
- [Payments API](05-payments-api.md) - Complete Payments API reference
- [Health API](06-health-api.md) - Health check endpoints
- [Metrics API](07-metrics-api.md) - Prometheus metrics endpoint
- [System API](08-system-api.md) - System information endpoint

