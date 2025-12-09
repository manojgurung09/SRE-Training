# SLOs and Error Budgets

Service Level Objectives (SLOs) and Error Budgets derived from real business metrics.

## Overview

SLOs define the reliability targets for the platform. Error budgets represent the acceptable amount of unreliability.

## Available Business Metrics

### Order Success Rate

**Metric:** `orders_success_total` / (`orders_success_total` + `orders_failed_total`)

**Source:** Metrics in `server/config/metrics.ts` lines 59-69. Incremented in `server/routes/orders.ts` lines 161, 164.

**Calculation:**
```promql
rate(orders_success_total[5m]) / 
(rate(orders_success_total[5m]) + rate(orders_failed_total[5m]))
```

### Payment Success Rate

**Metric:** `payments_processed_total{status="completed"}` / `payments_processed_total`

**Source:** Metric in `server/config/metrics.ts` lines 38-43. Incremented in `server/routes/payments.ts` line 105.

**Calculation:**
```promql
sum(rate(payments_processed_total{status="completed"}[5m])) / 
sum(rate(payments_processed_total[5m]))
```

### API Availability

**Metric:** `http_requests_total{status_code!~"5.."}` / `http_requests_total`

**Source:** Metric in `server/config/metrics.ts` lines 18-23. Incremented in `server/middleware/metricsMiddleware.ts` lines 33-37.

**Calculation:**
```promql
sum(rate(http_requests_total{status_code!~"5.."}[5m])) / 
sum(rate(http_requests_total[5m]))
```

### API Latency

**Metric:** `http_request_duration_seconds`

**Source:** Metric in `server/config/metrics.ts` lines 10-16. Observed in `server/middleware/metricsMiddleware.ts` lines 24-31.

**Percentiles:**
```promql
# P50
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))

# P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# P99
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

## Recommended SLOs

### Order Processing SLO

**Target:** 99.9% success rate

**Error Budget:** 0.1% failure rate

**Metric:** Order success rate

**Calculation:**
```promql
(
  sum(rate(orders_success_total[5m])) / 
  (sum(rate(orders_success_total[5m])) + sum(rate(orders_failed_total[5m])))
) >= 0.999
```

**Source:** Based on `orders_success_total` and `orders_failed_total` metrics.

### Payment Processing SLO

**Target:** 99.5% success rate

**Error Budget:** 0.5% failure rate

**Metric:** Payment success rate

**Calculation:**
```promql
(
  sum(rate(payments_processed_total{status="completed"}[5m])) / 
  sum(rate(payments_processed_total[5m]))
) >= 0.995
```

**Source:** Based on `payments_processed_total` metric with status label.

### API Availability SLO

**Target:** 99.9% availability

**Error Budget:** 0.1% downtime

**Metric:** API availability (non-5xx responses)

**Calculation:**
```promql
(
  sum(rate(http_requests_total{status_code!~"5.."}[5m])) / 
  sum(rate(http_requests_total[5m]))
) >= 0.999
```

**Source:** Based on `http_requests_total` metric with status_code label.

### API Latency SLO

**Target:** P95 latency < 500ms

**Error Budget:** 5% of requests can exceed 500ms

**Metric:** HTTP request duration

**Calculation:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) < 0.5
```

**Source:** Based on `http_request_duration_seconds` histogram.

## Error Budget Calculation

### Error Budget Formula

```
Error Budget = 1 - SLO Target
```

**Example:**
- SLO Target: 99.9%
- Error Budget: 0.1%

### Error Budget Consumption

**Calculation:**
```promql
# Error budget remaining
1 - (
  sum(rate(orders_failed_total[5m])) / 
  (sum(rate(orders_success_total[5m])) + sum(rate(orders_failed_total[5m])))
) / 0.001
```

**Interpretation:**
- > 1.0: Error budget exceeded
- 0.5-1.0: Warning threshold
- < 0.5: Healthy

## Alerting Rules

### Order Success Rate Alert

```yaml
groups:
  - name: slo_alerts
    rules:
      - alert: OrderSuccessRateLow
        expr: |
          (
            sum(rate(orders_success_total[5m])) / 
            (sum(rate(orders_success_total[5m])) + sum(rate(orders_failed_total[5m])))
          ) < 0.999
        for: 5m
        annotations:
          summary: "Order success rate below SLO (99.9%)"
```

**Source:** Based on `orders_success_total` and `orders_failed_total` metrics.

### Payment Success Rate Alert

```yaml
      - alert: PaymentSuccessRateLow
        expr: |
          (
            sum(rate(payments_processed_total{status="completed"}[5m])) / 
            sum(rate(payments_processed_total[5m]))
          ) < 0.995
        for: 5m
        annotations:
          summary: "Payment success rate below SLO (99.5%)"
```

**Source:** Based on `payments_processed_total` metric.

### API Availability Alert

```yaml
      - alert: APIAvailabilityLow
        expr: |
          (
            sum(rate(http_requests_total{status_code!~"5.."}[5m])) / 
            sum(rate(http_requests_total[5m]))
          ) < 0.999
        for: 5m
        annotations:
          summary: "API availability below SLO (99.9%)"
```

**Source:** Based on `http_requests_total` metric.

### API Latency Alert

```yaml
      - alert: APILatencyHigh
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        annotations:
          summary: "API P95 latency above SLO (500ms)"
```

**Source:** Based on `http_request_duration_seconds` histogram.

## Training vs Production

### Training Mode

**SLOs:** Relaxed for learning purposes

**Focus:** Understanding SLO concepts and error budgets

**Use Case:** SRE training, incident simulation

### Production Mode

**SLOs:** Strict enforcement

**Focus:** Meeting reliability targets

**Use Case:** Production monitoring, alerting, on-call

**⚠️ Production Note:** Adjust SLO targets based on business requirements and actual system performance.

## Error Budget Policy

### Budget Exhaustion

When error budget is exhausted:

1. **Freeze Feature Releases:** Stop deploying new features
2. **Focus on Reliability:** Dedicate resources to fixing issues
3. **Post-Mortem:** Conduct post-incident review
4. **Recovery Plan:** Implement fixes to restore budget

### Budget Recovery

Error budget recovers over time as system operates within SLO targets.

## Monitoring Dashboard

### Key Panels

1. **SLO Compliance:** Current SLO status for each service
2. **Error Budget Remaining:** Remaining error budget percentage
3. **Error Rate Trends:** Historical error rate trends
4. **Latency Percentiles:** P50, P95, P99 latency over time

**Source:** Dashboard panels based on available metrics in `server/config/metrics.ts`.

## Test Examples

**Source:** E2E test examples in `tests/e2e/04-orders-crud.test.ts`:

- SLO metrics validation: Lines 281-309

