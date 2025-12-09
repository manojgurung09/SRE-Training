# Metrics API

Prometheus metrics endpoint for observability.

## Endpoint

```
GET /metrics
```

**Source:** Route registration in `server/app.ts` lines 39-42.

## Response Format

**Content-Type:** `text/plain; version=0.0.4; charset=utf-8`

**Format:** Prometheus exposition format

**Source:** Content type set in `server/app.ts` line 40.

## Available Metrics

### HTTP Metrics

#### http_request_duration_seconds

**Type:** Histogram

**Labels:**
- `method` - HTTP method (GET, POST, PUT, DELETE, PATCH)
- `route` - Route path
- `status_code` - HTTP status code

**Buckets:** `[0.01, 0.05, 0.1, 0.5, 1, 2, 5]` seconds

**Source:** Metric definition in `server/config/metrics.ts` lines 10-16.

#### http_requests_total

**Type:** Counter

**Labels:**
- `method` - HTTP method
- `route` - Route path
- `status_code` - HTTP status code

**Source:** Metric definition in `server/config/metrics.ts` lines 18-23.

### Business Metrics

#### orders_created_total

**Type:** Counter

**Labels:**
- `status` - Order status (pending, processing, etc.)

**Source:** Metric definition in `server/config/metrics.ts` lines 25-30. Incremented in `server/routes/orders.ts` line 132.

#### orders_value_total

**Type:** Counter

**Description:** Total value of all orders in currency units

**Source:** Metric definition in `server/config/metrics.ts` lines 32-36. Incremented in `server/routes/orders.ts` line 133.

#### orders_success_total

**Type:** Counter

**Description:** Total number of successful orders

**Source:** Metric definition in `server/config/metrics.ts` lines 59-63. Incremented in `server/routes/orders.ts` line 161.

#### orders_failed_total

**Type:** Counter

**Description:** Total number of failed orders

**Source:** Metric definition in `server/config/metrics.ts` lines 65-69. Incremented in `server/routes/orders.ts` line 164.

#### payments_processed_total

**Type:** Counter

**Labels:**
- `status` - Payment status (completed, failed)
- `payment_method` - Payment method

**Source:** Metric definition in `server/config/metrics.ts` lines 38-43. Incremented in `server/routes/payments.ts` line 105.

#### payments_value_total

**Type:** Counter

**Labels:**
- `status` - Payment status

**Description:** Total value of all payments in currency units

**Source:** Metric definition in `server/config/metrics.ts` lines 45-50. Incremented in `server/routes/payments.ts` line 106.

### Error Metrics

#### errors_total

**Type:** Counter

**Labels:**
- `error_type` - Error type/name
- `endpoint` - Endpoint path

**Source:** Metric definition in `server/config/metrics.ts` lines 52-57. Incremented in `server/middleware/errorHandler.ts` lines 10-14.

### System Metrics

#### service_restarts_total

**Type:** Counter

**Description:** Total number of service restarts

**Source:** Metric definition in `server/config/metrics.ts` lines 83-87. Incremented in `server/index.ts` line 15.

#### external_call_latency_ms

**Type:** Histogram

**Labels:**
- `dependency` - External dependency (supabase, redis)

**Buckets:** `[1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]` milliseconds

**Source:** Metric definition in `server/config/metrics.ts` lines 89-95. Observed in `server/config/supabase.ts` lines 68, 72, 77 and `server/config/redis.ts` lines 54, 73, 91.

#### retry_attempts_total

**Type:** Counter

**Labels:**
- `dependency` - Dependency name (redis)

**Source:** Metric definition in `server/config/metrics.ts` lines 97-102. Incremented in `server/config/redis.ts` line 20.

#### circuit_breaker_open_total

**Type:** Counter

**Description:** Total number of circuit breaker openings

**Source:** Metric definition in `server/config/metrics.ts` lines 104-108. Incremented in `server/routes/payments.ts` line 80.

### Chaos Engineering Metrics

#### chaos_events_total

**Type:** Counter

**Description:** Total number of chaos engineering events

**Source:** Metric definition in `server/config/metrics.ts` lines 71-75. Incremented in `server/middleware/metricsMiddleware.ts` line 11.

#### simulated_latency_ms

**Type:** Gauge

**Description:** Simulated latency injected in milliseconds

**Source:** Metric definition in `server/config/metrics.ts` lines 77-81. Set in `server/middleware/metricsMiddleware.ts` line 15.

## Default Labels

All metrics include default labels:

- `app="sre-training-platform"`
- `environment` - Value of `NODE_ENV` (default: "development")

**Source:** Default labels in `server/config/metrics.ts` lines 5-8.

## Example Response

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{app="sre-training-platform",environment="development",method="GET",route="/api/products",status_code="200"} 42

# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{app="sre-training-platform",environment="development",method="GET",route="/api/products",status_code="200",le="0.01"} 10
http_request_duration_seconds_bucket{app="sre-training-platform",environment="development",method="GET",route="/api/products",status_code="200",le="0.05"} 35
http_request_duration_seconds_bucket{app="sre-training-platform",environment="development",method="GET",route="/api/products",status_code="200",le="+Inf"} 42
http_request_duration_seconds_sum{app="sre-training-platform",environment="development",method="GET",route="/api/products",status_code="200"} 1.234
http_request_duration_seconds_count{app="sre-training-platform",environment="development",method="GET",route="/api/products",status_code="200"} 42
```

## Prometheus Scraping

Configure Prometheus to scrape this endpoint:

```yaml
scrape_configs:
  - job_name: 'bharatmart-api'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:3000']
```

**Source:** Prometheus configuration example in `deployment/prometheus.yml` lines 18-25.

## Test Examples

**Source:** E2E test examples in `tests/e2e/07-observability.test.ts`:

- Metrics endpoint: Lines 8-15
- Prometheus format: Lines 17-36
- Required metrics: Lines 38-49

