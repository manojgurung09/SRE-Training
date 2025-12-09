# Chaos Engineering Overview

Chaos engineering capabilities and training use cases.

## What is Chaos Engineering?

Chaos engineering is the practice of intentionally injecting failures and latency into a system to test its resilience and identify weaknesses.

## Implementation

**Location:** `server/middleware/metricsMiddleware.ts`

**Source:** Chaos implementation in `server/middleware/metricsMiddleware.ts` lines 7-17.

## Chaos Features

### Latency Injection

**Purpose:** Simulate network latency or slow database queries

**Configuration:**
- `CHAOS_ENABLED=true` - Enable chaos engineering
- `CHAOS_LATENCY_MS=<milliseconds>` - Latency to inject

**Source:** Latency injection in `server/middleware/metricsMiddleware.ts` lines 14-17.

### Failure Simulation

**Purpose:** Simulate service failures

**Current Implementation:**
- Payment processing: 10% random failure rate

**Source:** Payment failure simulation in `server/routes/payments.ts` line 74.

## Training Use Cases

### SRE Training

- **Incident Response:** Practice responding to simulated failures
- **Observability:** Learn to identify issues through metrics and logs
- **Resilience Testing:** Understand system behavior under failure
- **Recovery Procedures:** Practice recovery from failures

### Production Considerations

**⚠️ Warning:** Chaos engineering should be used carefully in production:

- Start with low probability
- Use feature flags
- Monitor impact closely
- Have rollback procedures
- Test in staging first

**Source:** Chaos configuration is environment-variable based, allowing easy enable/disable.

## Safety Measures

### Configuration-Based

Chaos is controlled via environment variables, allowing easy enable/disable without code changes.

**Source:** Chaos configuration in `server/middleware/metricsMiddleware.ts` lines 7-8.

### Metrics Integration

All chaos events are tracked in Prometheus metrics:

- `chaos_events_total` - Total chaos events
- `simulated_latency_ms` - Current simulated latency

**Source:** Chaos metrics in `server/config/metrics.ts` lines 71-81.

## Principles

1. **Start Small:** Begin with low-impact chaos
2. **Monitor Closely:** Watch metrics and logs during chaos
3. **Have Rollback:** Be able to disable chaos immediately
4. **Learn and Improve:** Use chaos results to improve system resilience

## Chaos vs Testing

**Testing:** Validates expected behavior

**Chaos Engineering:** Discovers unexpected behavior and system limits

**Source:** Chaos engineering is complementary to traditional testing.

## Test Examples

**Source:** E2E test examples in `tests/e2e/08-chaos-engineering.test.ts`:

- Latency injection: Lines 24-41
- Chaos events counter: Lines 62-78
- Configuration respect: Lines 80-110

