# Prometheus Setup

Complete guide for setting up and configuring Prometheus for metrics collection.

## Overview

**Purpose:** Collect and store metrics from the BharatMart platform

**Configuration File:** `deployment/prometheus.yml`

**Source:** Prometheus configuration in `deployment/prometheus.yml`.

## Installation

### Docker Compose

**Included in:** `deployment/docker-compose.yml`

**Service:**
```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9091:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus-data:/prometheus
```

**Start:**
```bash
docker-compose up prometheus
```

**Source:** Prometheus service in `deployment/docker-compose.yml` lines 104-117.

### Standalone Installation

**Download:**
```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

**Start:**
```bash
./prometheus --config.file=prometheus.yml
```

**Source:** Prometheus installation.

## Configuration

### Global Settings

**File:** `deployment/prometheus.yml`

**Settings:**
- Scrape interval: 15s
- Evaluation interval: 15s
- External labels: cluster, region

**Source:** Global configuration in `deployment/prometheus.yml` lines 3-8.

### Scrape Jobs

**Backend API:**
- Job name: `backend-api`
- Metrics path: `/metrics`
- Target: `backend:3000` (or `localhost:3000`)

**Source:** Backend scrape job in `deployment/prometheus.yml` lines 18-25.

**Redis Cache:**
- Job name: `redis-cache`
- Target: `cache:6379` (requires redis_exporter)

**Source:** Redis cache scrape job in `deployment/prometheus.yml` lines 27-33.

**Redis Queue:**
- Job name: `redis-queue`
- Target: `queue:6379` (requires redis_exporter)

**Source:** Redis queue scrape job in `deployment/prometheus.yml` lines 35-41.

**Workers:**
- Job name: `workers`
- Targets: `worker-email:9090`, `worker-orders:9090`

**Source:** Workers scrape job in `deployment/prometheus.yml` lines 43-49.

## Accessing Prometheus

### Web UI

**URL:** http://localhost:9090 (or 9091 in Docker Compose)

**Features:**
- Query metrics
- View graphs
- Check targets
- View configuration

**Source:** Prometheus web UI.

### Query Examples

**Request Rate:**
```promql
rate(http_requests_total[5m])
```

**Error Rate:**
```promql
rate(http_requests_total{status_code=~"5.."}[5m])
```

**P95 Latency:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Source:** PromQL query examples.

## Target Status

### Checking Targets

**In UI:**
- Navigate to Status → Targets
- Check target health
- View last scrape time

**Source:** Prometheus target status.

### Common Issues

**Target Down:**
- Check service is running
- Verify network connectivity
- Check firewall rules
- Verify metrics endpoint

**Source:** Target troubleshooting.

## Storage

### Data Retention

**Default:** 15 days

**Configuration:**
```yaml
--storage.tsdb.retention.time=30d
```

**Source:** Prometheus retention configuration.

### Storage Location

**Docker Compose:**
- Volume: `prometheus-data`
- Path: `/prometheus`

**Standalone:**
- Default: `./data`
- Configurable via `--storage.tsdb.path`

**Source:** Storage configuration.

## Integration with Grafana

### Data Source Configuration

**In Grafana:**
1. Add data source
2. Type: Prometheus
3. URL: http://prometheus:9090
4. Save and test

**Source:** Grafana Prometheus integration.

## Training vs Production

### Training Mode

**Configuration:** Basic setup for learning

**Use Case:** Understanding Prometheus

### Production Mode

**Configuration:** Full setup with retention, alerts

**Use Case:** Production monitoring

**Source:** Prometheus configuration modes.

## Next Steps

- [Metrics Reference](02-metrics.md) - Available metrics
- [Grafana Dashboards](06-grafana-dashboards.md) - Dashboard creation
- [Alerting](07-alerting.md) - Alert configuration

