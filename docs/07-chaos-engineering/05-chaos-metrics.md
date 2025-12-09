# Chaos Metrics

Complete documentation of chaos engineering metrics.

## Overview

**Metrics:** Prometheus metrics for chaos engineering

**Location:** `server/config/metrics.ts`

**Source:** Chaos metrics in `server/config/metrics.ts` lines 70-80.

## Chaos Metrics

### chaos_events_total

**Type:** Counter

**Purpose:** Total number of chaos engineering events

**Labels:** None

**Incremented:** When chaos event is triggered (10% probability)

**Source:** Metric definition in `server/config/metrics.ts` lines 71-75.

**Usage:**
```promql
rate(chaos_events_total[5m])
```

### simulated_latency_ms

**Type:** Gauge

**Purpose:** Simulated latency injected in milliseconds

**Labels:** None

**Set:** When `CHAOS_LATENCY_MS` is configured

**Source:** Metric definition in `server/config/metrics.ts` lines 77-80.

**Usage:**
```promql
simulated_latency_ms
```

## Related Metrics

### HTTP Request Metrics

**Impact of Chaos:**
- `http_request_duration_seconds` - Latency increases
- `http_requests_total` - Request count

**Source:** HTTP metrics in `server/config/metrics.ts` lines 10-23.

### Payment Failure Metrics

**Related to Failure Simulation:**
- `payment_processed_total{status="failed"}` - Failed payments
- `circuit_breaker_open_total` - Circuit breaker opens

**Source:** Payment metrics in `server/config/metrics.ts`.

## Monitoring Chaos

### Dashboard Panels

**Chaos Events:**
```promql
sum(rate(chaos_events_total[5m]))
```

**Simulated Latency:**
```promql
simulated_latency_ms
```

**Request Latency with Chaos:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Source:** Dashboard queries.

## Alerting

### Chaos Event Alerts

**Alert:** High chaos event rate

**Query:**
```promql
rate(chaos_events_total[5m]) > 10
```

**Source:** Alert configuration.

### Latency Alerts

**Alert:** High simulated latency

**Query:**
```promql
simulated_latency_ms > 500
```

**Source:** Latency alert.

## Training vs Production

### Training Mode

**Metrics:** Enabled for learning

**Use Case:** Understanding chaos impact

### Production Mode

**Metrics:** Should be zero (chaos disabled)

**Use Case:** Monitoring (should remain at 0)

**Source:** Metrics mode differences.

## Next Steps

- [Chaos Overview](01-chaos-overview.md) - Chaos engineering overview
- [Chaos Configuration](02-chaos-configuration.md) - Configuration guide
- [Chaos Scenarios](06-chaos-scenarios.md) - Scenario examples

