# Tracing

OpenTelemetry distributed tracing configuration and usage.

## Overview

**Framework:** OpenTelemetry

**SDK:** `@opentelemetry/sdk-node` 0.51.0

**Auto-Instrumentation:** `@opentelemetry/auto-instrumentations-node` 0.51.0

**Exporter:** OTLP HTTP

**Source:** Tracing setup in `server/tracing.ts`.

## Configuration

### Environment Variables

#### OTEL_EXPORTER_OTLP_ENDPOINT

**Type:** URL (string)

**Required:** No (tracing is optional)

**Purpose:** OTLP collector endpoint URL

**Example:**
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

**Source:** OTLP endpoint configuration in `server/tracing.ts` line 13.

#### OTEL_SERVICE_NAME

**Type:** String

**Required:** No

**Default:** `bharatmart-backend`

**Purpose:** Service name for traces

**Example:**
```bash
OTEL_SERVICE_NAME=bharatmart-api
```

**Source:** Service name configuration in `server/tracing.ts` line 12.

## Initialization

Tracing is initialized at application startup:

```typescript
import './tracing';
```

**Source:** Tracing import in `server/index.ts` line 4 and `server/app.ts` line 4.

### Initialization Logic

1. **Check for OTLP Endpoint:** Tracing only initializes if `OTEL_EXPORTER_OTLP_ENDPOINT` is set
2. **Create SDK:** NodeSDK with resource and exporter
3. **Auto-Instrumentation:** Automatically instruments HTTP, database, Redis calls
4. **Start SDK:** Begin trace collection

**Source:** Initialization in `server/tracing.ts` lines 15-32.

## Auto-Instrumentation

The following are automatically instrumented:

- **HTTP Requests:** Express routes
- **Database Calls:** Supabase/PostgreSQL queries
- **Redis Calls:** Cache and queue operations
- **HTTP Client:** Outgoing HTTP requests

**Source:** Auto-instrumentation in `server/tracing.ts` line 23.

## Trace Structure

### Service Name

**Default:** `bharatmart-backend`

**Configurable:** Via `OTEL_SERVICE_NAME` environment variable

**Source:** Service name in `server/tracing.ts` line 12.

### Resource Attributes

- `service.name` - Service identifier

**Source:** Resource configuration in `server/tracing.ts` lines 17-19.

## Trace Analysis

### Viewing Traces

**Tools:**
- Jaeger UI
- Zipkin UI
- Datadog APM
- OCI APM

**Endpoint:** Configure OTLP endpoint to point to your trace collector

### Trace Correlation

Traces automatically correlate:
- HTTP requests
- Database queries
- Cache operations
- Worker jobs

**Source:** Auto-instrumentation covers all these operations.

## Performance Impact

**Impact:** Minimal (tracing is asynchronous)

**Overhead:** < 1% for typical workloads

**Source:** OpenTelemetry is designed for low overhead.

## Production Setup

### 1. Deploy OTLP Collector

Deploy an OTLP collector (e.g., OpenTelemetry Collector, Jaeger, Zipkin)

### 2. Configure Endpoint

Set `OTEL_EXPORTER_OTLP_ENDPOINT` to your collector URL

### 3. Verify Traces

Check trace collector UI for incoming traces

**Source:** Tracing is optional and only activates when endpoint is configured.

## Training Use Cases

### SRE Training

- **Distributed Tracing Labs:** Learn to trace requests across services
- **Performance Analysis:** Identify bottlenecks in request flow
- **Debugging:** Use traces to debug complex issues

**Source:** Tracing can be enabled for training purposes.

## Troubleshooting

### Traces Not Appearing

1. **Check Endpoint:** Verify `OTEL_EXPORTER_OTLP_ENDPOINT` is set correctly
2. **Check Collector:** Ensure OTLP collector is running and accessible
3. **Check Logs:** Look for initialization errors in server logs

**Source:** Tracing initialization includes error handling in `server/tracing.ts` lines 26-31.

### High Overhead

If tracing causes performance issues:
- Reduce sampling rate (if supported by collector)
- Disable tracing in high-traffic scenarios
- Use sampling to reduce trace volume

**Source:** Tracing is optional and can be disabled by not setting the endpoint.

## Test Examples

**Source:** E2E test examples in `tests/e2e/07-observability.test.ts`:

- OTLP endpoint configuration: Lines 148-154
- Service name configuration: Lines 156-161
- Trace generation: Lines 163-175

