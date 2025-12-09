# Grafana Dashboards

Guide for creating and configuring Grafana dashboards.

## Overview

**Purpose:** Visualize metrics and create monitoring dashboards

**Access:** http://localhost:3001 (Docker Compose)

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Source:** Grafana configuration in `deployment/docker-compose.yml` lines 119-132.

## Setup

### Docker Compose

**Service:**
```yaml
grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - grafana-data:/var/lib/grafana
  depends_on:
    - prometheus
```

**Start:**
```bash
docker-compose up grafana
```

**Source:** Grafana service in `deployment/docker-compose.yml` lines 119-132.

### Standalone Installation

**Install:**
```bash
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

**Source:** Grafana installation.

## Data Source Configuration

### Add Prometheus Data Source

**Steps:**
1. Navigate to Configuration → Data Sources
2. Add data source
3. Select Prometheus
4. URL: http://prometheus:9090 (or http://localhost:9090)
5. Save and test

**Source:** Grafana data source configuration.

## Dashboard Creation

### HTTP Request Metrics Dashboard

**Panels:**

**1. Request Rate:**
```promql
sum(rate(http_requests_total[5m])) by (method)
```

**2. Error Rate:**
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
```

**3. P95 Latency:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**4. Request by Status:**
```promql
sum(rate(http_requests_total[5m])) by (status_code)
```

**Source:** HTTP metrics in `server/config/metrics.ts` lines 10-23.

### Business Metrics Dashboard

**Panels:**

**1. Order Success Rate:**
```promql
sum(rate(orders_success_total[5m])) / 
(sum(rate(orders_success_total[5m])) + sum(rate(orders_failed_total[5m])))
```

**2. Payment Success Rate:**
```promql
sum(rate(payments_processed_total{status="completed"}[5m])) / 
sum(rate(payments_processed_total[5m]))
```

**3. Order Value:**
```promql
sum(rate(order_value_total[5m]))
```

**4. Payment Value:**
```promql
sum(rate(payment_value_total[5m]))
```

**Source:** Business metrics in `server/config/metrics.ts` lines 38-69.

### System Metrics Dashboard

**Panels:**

**1. External Call Latency:**
```promql
histogram_quantile(0.95, rate(external_call_latency_ms_bucket[5m])) by (dependency)
```

**2. Retry Attempts:**
```promql
sum(rate(retry_attempts_total[5m])) by (dependency)
```

**3. Circuit Breaker Opens:**
```promql
sum(rate(circuit_breaker_open_total[5m]))
```

**Source:** System metrics in `server/config/metrics.ts`.

### Chaos Engineering Dashboard

**Panels:**

**1. Chaos Events:**
```promql
sum(rate(chaos_events_total[5m]))
```

**2. Simulated Latency:**
```promql
simulated_latency_ms
```

**3. Request Latency with Chaos:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Source:** Chaos metrics in `server/config/metrics.ts` lines 70-75.

## Dashboard Best Practices

### Panel Configuration

**Time Range:**
- Default: Last 6 hours
- Options: Last hour, day, week

**Refresh Interval:**
- Default: 30s
- Options: 10s, 30s, 1m, 5m

**Source:** Grafana panel configuration.

### Alert Configuration

**In Panels:**
- Set alert thresholds
- Configure notification channels
- Set evaluation intervals

**Source:** Grafana alerting.

## Training vs Production

### Training Mode

**Dashboards:** Basic dashboards for learning

**Use Case:** Understanding metrics visualization

### Production Mode

**Dashboards:** Comprehensive dashboards with alerts

**Use Case:** Production monitoring

**Source:** Dashboard configuration modes.

## Next Steps

- [Metrics Reference](02-metrics.md) - Available metrics
- [Prometheus Setup](05-prometheus-setup.md) - Prometheus configuration
- [Alerting](07-alerting.md) - Alert configuration

