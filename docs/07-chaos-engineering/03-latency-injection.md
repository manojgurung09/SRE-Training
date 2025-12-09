# Latency Injection

Complete guide to latency injection in chaos engineering.

## Overview

**Purpose:** Simulate network latency and slow responses

**Implementation:** Middleware-based latency injection

**Source:** Latency injection in `server/middleware/metricsMiddleware.ts` lines 14-17.

## Configuration

### Enable Latency Injection

**Environment Variables:**
```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=100
```

**CHAOS_LATENCY_MS:** Latency in milliseconds to inject

**Source:** Chaos configuration in `server/middleware/metricsMiddleware.ts` lines 7-8.

## How It Works

### Injection Mechanism

**Process:**
1. Check if `CHAOS_ENABLED=true`
2. Read `CHAOS_LATENCY_MS` value
3. If latency > 0, inject delay before request processing
4. Set `simulated_latency_ms` gauge metric
5. Wait for specified milliseconds

**Source:** Injection logic in `server/middleware/metricsMiddleware.ts` lines 14-17.

### Code Implementation

```typescript
if (chaosLatencyMs > 0) {
  simulatedLatencyMs.set(chaosLatencyMs);
  await new Promise(resolve => setTimeout(resolve, chaosLatencyMs));
}
```

**Source:** Implementation in `server/middleware/metricsMiddleware.ts` lines 14-17.

## Latency Values

### Recommended Values

**Minimal Impact:**
- 50ms - Barely noticeable

**Noticeable:**
- 100ms - User may notice delay

**Significant:**
- 200ms - Clear delay

**High Impact:**
- 500ms - Significant delay
- 1000ms - Very slow

**Source:** Latency value recommendations.

## Metrics

### Simulated Latency Metric

**Metric:** `simulated_latency_ms`

**Type:** Gauge

**Purpose:** Current latency value being injected

**Source:** Metric definition in `server/config/metrics.ts` lines 77-80.

### Request Duration Impact

**Metric:** `http_request_duration_seconds`

**Impact:** Latency injection adds to request duration

**Observation:** P95/P99 latency increases by injected amount

**Source:** Request duration metric in `server/config/metrics.ts` lines 10-16.

## Use Cases

### Training Scenarios

**High Latency Scenario:**
- Set `CHAOS_LATENCY_MS=500`
- Observe user experience
- Analyze metrics
- Practice mitigation

**Source:** Training use cases.

### Resilience Testing

**Test:**
- How system handles latency
- Timeout behavior
- Retry mechanisms
- User experience

**Source:** Resilience testing.

## Monitoring

### Metrics to Watch

**Request Latency:**
- P50, P95, P99 percentiles
- Compare with/without chaos

**Error Rate:**
- Timeout errors
- Connection errors

**User Experience:**
- Response times
- Error rates

**Source:** Monitoring metrics.

## Best Practices

### Latency Injection

**Guidelines:**
- Start with low values
- Gradually increase
- Monitor impact
- Document findings

**Source:** Best practices.

### Production Warning

**⚠️ Never enable in production:**
- Latency injection is for training/testing only
- Disable before production deployment
- Remove from production configuration

**Source:** Production safety warning.

## Training vs Production

### Training Mode

**Use:** Enable for learning and testing

**Values:** 50ms - 1000ms

**Source:** Training mode usage.

### Production Mode

**Use:** Disabled

**Configuration:** `CHAOS_ENABLED=false` or not set

**Source:** Production mode requirement.

## Next Steps

- [Chaos Overview](01-chaos-overview.md) - Chaos engineering overview
- [Chaos Configuration](02-chaos-configuration.md) - Configuration guide
- [Failure Simulation](04-failure-simulation.md) - Failure injection

