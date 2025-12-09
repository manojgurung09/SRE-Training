# Alerting

Complete guide for configuring alerts based on metrics and SLOs.

## Overview

**Purpose:** Get notified when metrics exceed thresholds or SLOs are violated

**Tools:**
- Prometheus Alertmanager
- Grafana Alerts
- Custom alerting solutions

**Source:** Alerting configuration.

## Prometheus Alertmanager

### Installation

**Docker Compose:**
```yaml
alertmanager:
  image: prom/alertmanager:latest
  ports:
    - "9093:9093"
  volumes:
    - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
```

**Source:** Alertmanager Docker Compose configuration.

### Configuration

**File:** `alertmanager.yml`

**Example:**
```yaml
route:
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://webhook:5001/alert'
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'your-key'
  - name: 'slack'
    slack_configs:
      - api_url: 'your-slack-webhook'
```

**Source:** Alertmanager configuration example.

## Alert Rules

### SLO Violation Alerts

**Order Success Rate:**
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
          description: "Order success rate is {{ $value | humanizePercentage }}"
```

**Source:** SLO alert rules in `docs/06-observability/08-slos-and-error-budgets.md`.

**Payment Success Rate:**
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

**Source:** Payment SLO alert.

**API Availability:**
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

**Source:** API availability alert.

**API Latency:**
```yaml
      - alert: APILatencyHigh
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        annotations:
          summary: "API P95 latency above SLO (500ms)"
```

**Source:** API latency alert.

### Error Rate Alerts

**High Error Rate:**
```yaml
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) > 10
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/second"
```

**Source:** Error rate alert.

### System Alerts

**High External Call Latency:**
```yaml
      - alert: HighExternalCallLatency
        expr: |
          histogram_quantile(0.95, rate(external_call_latency_ms_bucket[5m])) > 1000
        for: 5m
        annotations:
          summary: "High external call latency"
```

**Source:** External call latency alert.

**Circuit Breaker Open:**
```yaml
      - alert: CircuitBreakerOpen
        expr: |
          rate(circuit_breaker_open_total[5m]) > 0
        for: 1m
        annotations:
          summary: "Circuit breaker opened"
```

**Source:** Circuit breaker alert.

## Grafana Alerts

### Creating Alerts

**Steps:**
1. Create panel with metric
2. Click "Alert" tab
3. Configure conditions
4. Set thresholds
5. Configure notifications

**Source:** Grafana alerting.

### Alert Conditions

**Example:**
- Metric: `http_requests_total`
- Condition: `WHEN avg() OF query(A, 5m, now) IS ABOVE 1000`
- Evaluation: Every 30s
- For: 5 minutes

**Source:** Grafana alert conditions.

## Notification Channels

### Slack

**Configuration:**
- Webhook URL
- Channel
- Username
- Icon

**Source:** Slack notification configuration.

### Email

**Configuration:**
- SMTP server
- From address
- To addresses
- Authentication

**Source:** Email notification configuration.

### PagerDuty

**Configuration:**
- Service key
- Integration type
- Severity mapping

**Source:** PagerDuty integration.

## Alert Best Practices

### Alert Design

**Principles:**
- Alert on symptoms, not causes
- Use appropriate thresholds
- Avoid alert fatigue
- Document alert purpose

**Source:** Alert design best practices.

### Thresholds

**Recommendations:**
- Start conservative
- Adjust based on data
- Use SLOs as thresholds
- Consider error budgets

**Source:** Threshold best practices.

## Training vs Production

### Training Mode

**Alerts:** Basic alerts for learning

**Use Case:** Understanding alerting concepts

### Production Mode

**Alerts:** Comprehensive alerting with on-call

**Use Case:** Production monitoring

**Source:** Alerting configuration modes.

## Next Steps

- [SLOs & Error Budgets](08-slos-and-error-budgets.md) - SLO-based alerting
- [Prometheus Setup](05-prometheus-setup.md) - Prometheus configuration
- [Grafana Dashboards](06-grafana-dashboards.md) - Dashboard creation

