# Metrics

Complete reference for all Prometheus metrics exposed by the platform.

## Metrics Endpoint

**Endpoint:** `GET /metrics`

**Format:** Prometheus exposition format

**Source:** Metrics endpoint in `server/app.ts` lines 39-42.

## HTTP Metrics

### http_request_duration_seconds

**Type:** Histogram

**Description:** Duration of HTTP requests in seconds

**Labels:**
- `method` - HTTP method (GET, POST, PUT, DELETE, PATCH)
- `route` - Route path (e.g., `/api/products`)
- `status_code` - HTTP status code (200, 400, 404, 500, etc.)

**Buckets:** `[0.01, 0.05, 0.1, 0.5, 1, 2, 5]` seconds

**Source:** Metric definition in `server/config/metrics.ts` lines 10-16. Observed in `server/middleware/metricsMiddleware.ts` lines 24-31.

**Example Query:**
```promql
# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Average latency
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### http_requests_total

**Type:** Counter

**Description:** Total number of HTTP requests

**Labels:**
- `method` - HTTP method
- `route` - Route path
- `status_code` - HTTP status code

**Source:** Metric definition in `server/config/metrics.ts` lines 18-23. Incremented in `server/middleware/metricsMiddleware.ts` lines 33-37.

**Example Query:**
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])
```

## Business Metrics

### orders_created_total

**Type:** Counter

**Description:** Total number of orders created

**Labels:**
- `status` - Order status (pending, processing, shipped, delivered, cancelled)

**Source:** Metric definition in `server/config/metrics.ts` lines 25-30. Incremented in `server/routes/orders.ts` line 132.

**Example Query:**
```promql
# Order creation rate
rate(orders_created_total[5m])

# Orders by status
sum by (status) (orders_created_total)
```

### orders_value_total

**Type:** Counter

**Description:** Total value of all orders in currency units

**Source:** Metric definition in `server/config/metrics.ts` lines 32-36. Incremented in `server/routes/orders.ts` line 133.

**Example Query:**
```promql
# Total revenue
orders_value_total

# Revenue rate
rate(orders_value_total[5m])
```

### orders_success_total

**Type:** Counter

**Description:** Total number of successful orders

**Source:** Metric definition in `server/config/metrics.ts` lines 59-63. Incremented in `server/routes/orders.ts` line 161.

**Example Query:**
```promql
# Success rate
rate(orders_success_total[5m])
```

### orders_failed_total

**Type:** Counter

**Description:** Total number of failed orders

**Source:** Metric definition in `server/config/metrics.ts` lines 65-69. Incremented in `server/routes/orders.ts` line 164.

**Example Query:**
```promql
# Failure rate
rate(orders_failed_total[5m])

# Success ratio
rate(orders_success_total[5m]) / (rate(orders_success_total[5m]) + rate(orders_failed_total[5m]))
```

### payments_processed_total

**Type:** Counter

**Description:** Total number of payments processed

**Labels:**
- `status` - Payment status (completed, failed)
- `payment_method` - Payment method (credit_card, etc.)

**Source:** Metric definition in `server/config/metrics.ts` lines 38-43. Incremented in `server/routes/payments.ts` line 105.

**Example Query:**
```promql
# Payment processing rate
rate(payments_processed_total[5m])

# Payments by status
sum by (status) (payments_processed_total)
```

### payments_value_total

**Type:** Counter

**Description:** Total value of all payments in currency units

**Labels:**
- `status` - Payment status

**Source:** Metric definition in `server/config/metrics.ts` lines 45-50. Incremented in `server/routes/payments.ts` line 106.

**Example Query:**
```promql
# Total payment value
payments_value_total

# Payment value by status
sum by (status) (payments_value_total)
```

## Error Metrics

### errors_total

**Type:** Counter

**Description:** Total number of errors

**Labels:**
- `error_type` - Error type/name
- `endpoint` - Endpoint path

**Source:** Metric definition in `server/config/metrics.ts` lines 52-57. Incremented in `server/middleware/errorHandler.ts` lines 10-14.

**Example Query:**
```promql
# Error rate
rate(errors_total[5m])

# Errors by type
sum by (error_type) (errors_total)
```

## System Metrics

### service_restarts_total

**Type:** Counter

**Description:** Total number of service restarts

**Source:** Metric definition in `server/config/metrics.ts` lines 83-87. Incremented in `server/index.ts` line 15.

**Example Query:**
```promql
# Restart count
service_restarts_total
```

### external_call_latency_ms

**Type:** Histogram

**Description:** Latency of external calls in milliseconds

**Labels:**
- `dependency` - External dependency (supabase, redis)

**Buckets:** `[1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]` milliseconds

**Source:** Metric definition in `server/config/metrics.ts` lines 89-95. Observed in:
- `server/config/supabase.ts` lines 68, 72, 77
- `server/config/redis.ts` lines 54, 73, 91

**Example Query:**
```promql
# P95 external call latency
histogram_quantile(0.95, rate(external_call_latency_ms_bucket[5m]))

# Average latency by dependency
rate(external_call_latency_ms_sum[5m]) / rate(external_call_latency_ms_count[5m])
```

### retry_attempts_total

**Type:** Counter

**Description:** Total number of retry attempts

**Labels:**
- `dependency` - Dependency name (redis)

**Source:** Metric definition in `server/config/metrics.ts` lines 97-102. Incremented in `server/config/redis.ts` line 20.

**Example Query:**
```promql
# Retry rate
rate(retry_attempts_total[5m])

# Retries by dependency
sum by (dependency) (retry_attempts_total)
```

### circuit_breaker_open_total

**Type:** Counter

**Description:** Total number of circuit breaker openings

**Source:** Metric definition in `server/config/metrics.ts` lines 104-108. Incremented in `server/routes/payments.ts` line 80 (on payment failure).

**Example Query:**
```promql
# Circuit breaker openings
circuit_breaker_open_total

# Opening rate
rate(circuit_breaker_open_total[5m])
```

## Chaos Engineering Metrics

### chaos_events_total

**Type:** Counter

**Description:** Total number of chaos engineering events

**Source:** Metric definition in `server/config/metrics.ts` lines 71-75. Incremented in `server/middleware/metricsMiddleware.ts` line 11 (10% random chance when `CHAOS_ENABLED=true`).

**Example Query:**
```promql
# Chaos event rate
rate(chaos_events_total[5m])
```

### simulated_latency_ms

**Type:** Gauge

**Description:** Simulated latency injected in milliseconds

**Source:** Metric definition in `server/config/metrics.ts` lines 77-81. Set in `server/middleware/metricsMiddleware.ts` line 15 (when `CHAOS_LATENCY_MS` is set).

**Example Query:**
```promql
# Current simulated latency
simulated_latency_ms
```

## Default Labels

All metrics include default labels:

- `app="sre-training-platform"`
- `environment` - Value of `NODE_ENV` (default: "development")

**Source:** Default labels in `server/config/metrics.ts` lines 5-8.

## Metric Naming Conventions

- **Counters:** End with `_total`
- **Histograms:** Use descriptive names with units (e.g., `_duration_seconds`, `_latency_ms`)
- **Gauges:** Use descriptive names with units
- **Labels:** Use snake_case

**Source:** Naming conventions observed in `server/config/metrics.ts`.

## Test Examples

**Source:** E2E test examples in `tests/e2e/07-observability.test.ts`:

- Metrics endpoint: Lines 8-15
- Prometheus format: Lines 17-36
- Required metrics: Lines 38-49

