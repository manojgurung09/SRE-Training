# Observability Overview

Complete observability strategy covering metrics, logs, and traces.

## Three Pillars of Observability

### 1. Metrics

**Purpose:** Quantitative measurements of system behavior

**Implementation:** Prometheus metrics exposed at `/metrics` endpoint

**Key Metrics:**
- HTTP request metrics (rate, latency, errors)
- Business metrics (orders, payments)
- System metrics (external calls, retries, circuit breakers)
- Chaos engineering metrics

**Source:** Metrics configuration in `server/config/metrics.ts`. Metrics endpoint in `server/app.ts` lines 39-42.

### 2. Logging

**Purpose:** Structured event logs for debugging and analysis

**Implementation:** Winston logger with JSON format

**Key Logs:**
- API request/response logs
- Business event logs (orders, payments)
- Error logs with stack traces
- Worker job logs

**Source:** Logger configuration in `server/config/logger.ts`. Request logging in `server/middleware/logger.ts`.

### 3. Tracing

**Purpose:** Distributed request tracing across services

**Implementation:** OpenTelemetry with OTLP exporter

**Configuration:** Optional (requires `OTEL_EXPORTER_OTLP_ENDPOINT`)

**Source:** Tracing configuration in `server/tracing.ts`.

## Tools & Stack

### Metrics

- **Prometheus Client:** `prom-client` 15.1
- **Exposition Format:** Prometheus text format
- **Endpoint:** `GET /metrics`

**Source:** Metrics client in `package.json` line 48. Metrics registry in `server/config/metrics.ts` lines 1-3.

### Logging

- **Winston:** 3.11
- **Format:** JSON (structured)
- **Output:** Console + File (configurable)

**Source:** Winston dependency in `package.json` line 52. Logger setup in `server/config/logger.ts`.

### Tracing

- **OpenTelemetry SDK:** `@opentelemetry/sdk-node` 0.51.0
- **Auto-Instrumentation:** `@opentelemetry/auto-instrumentations-node` 0.51.0
- **Exporter:** OTLP HTTP

**Source:** OpenTelemetry dependencies in `package.json` lines 31-35. Tracing setup in `server/tracing.ts`.

## Observability Architecture

```
┌─────────────────┐
│   Application   │
│  (Express API)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌────────┐
│Metrics │ │Logs  │ │ Traces  │ │Business│
│/metrics│ │File  │ │  OTLP   │ │ Events │
└────┬───┘ └───┬──┘ └────┬────┘ └───┬────┘
     │         │         │          │
     ▼         ▼         ▼          ▼
┌─────────────────────────────────────┐
│      Observability Backend           │
│  Prometheus | Log Aggregator | OTLP │
└─────────────────────────────────────┘
```

**Source:** Architecture derived from implementation in `server/config/metrics.ts`, `server/config/logger.ts`, and `server/tracing.ts`.

## Best Practices

### Metrics

1. **Use Appropriate Metric Types:**
   - Counters for cumulative values
   - Histograms for latency distributions
   - Gauges for current values

2. **Label Dimensions:**
   - Include relevant labels (method, route, status)
   - Avoid high-cardinality labels

3. **Metric Naming:**
   - Use descriptive names
   - Include units in names
   - Follow Prometheus conventions

**Source:** Metric types and naming in `server/config/metrics.ts`.

### Logging

1. **Structured Logging:**
   - Always use JSON format
   - Include context (request ID, user ID, etc.)
   - Use appropriate log levels

2. **Log Levels:**
   - `error` - Errors requiring attention
   - `warn` - Warnings
   - `info` - Informational events
   - `debug` - Debug information

3. **Business Events:**
   - Log important business events (orders, payments)
   - Include relevant metadata

**Source:** Logging practices in `server/config/logger.ts` and `server/middleware/logger.ts`.

### Tracing

1. **Distributed Tracing:**
   - Enable in production for request correlation
   - Use OTLP for vendor-agnostic tracing

2. **Instrumentation:**
   - Auto-instrumentation covers HTTP, database, Redis
   - Manual instrumentation for custom spans

**Source:** Tracing setup in `server/tracing.ts` lines 16-24.

## Training vs Production

### Training Mode

- **Metrics:** Full metrics available for learning
- **Logging:** Detailed logs for debugging
- **Tracing:** Optional (can be enabled for learning)

**Use Case:** SRE training, incident simulation labs

### Production Mode

- **Metrics:** Essential for monitoring and alerting
- **Logging:** Structured logs for analysis
- **Tracing:** Recommended for distributed systems

**Use Case:** Production monitoring, troubleshooting, performance analysis

## Integration Points

### Prometheus Scraping

Configure Prometheus to scrape metrics:

```yaml
scrape_configs:
  - job_name: 'bharatmart-api'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:3000']
```

**Source:** Prometheus configuration in `deployment/prometheus.yml` lines 18-25.

### Log Aggregation

**Current:** Logs written to file

**Production Recommendation:** Integrate with:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog
- CloudWatch (AWS)
- OCI Logging (Oracle Cloud)

**Source:** Log file output in `server/config/logger.ts` lines 38-52.

### Trace Collection

**Current:** OTLP exporter (optional)

**Production Recommendation:** Use:
- Jaeger
- Zipkin
- Datadog APM
- OCI APM (Oracle Cloud)

**Source:** OTLP configuration in `server/tracing.ts` lines 20-22.

## Next Steps

- [Metrics Reference](02-metrics.md) - Complete metrics documentation
- [Logging Guide](03-logging.md) - Logging configuration and usage
- [Tracing Setup](04-tracing.md) - Distributed tracing configuration
- [Prometheus Setup](05-prometheus-setup.md) - Prometheus installation and configuration
- [Grafana Dashboards](06-grafana-dashboards.md) - Dashboard creation
- [Alerting](07-alerting.md) - Alert configuration
- [SLOs & Error Budgets](08-slos-and-error-budgets.md) - Service level objectives

