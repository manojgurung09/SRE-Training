# Chaos Scenarios

Complete guide to chaos engineering scenarios and experiments.

## Overview

**Purpose:** Predefined chaos scenarios for testing

**Format:** Step-by-step scenarios

**Source:** Chaos scenarios based on platform capabilities.

## Scenario 1: High Latency

### Objective

Test system behavior under high latency conditions.

### Configuration

```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=500
```

### Steps

1. Enable chaos with 500ms latency
2. Make API requests
3. Observe response times
4. Check metrics:
   - `http_request_duration_seconds`
   - `simulated_latency_ms`
5. Analyze impact on user experience

### Expected Results

- Request latency increases by ~500ms
- P95/P99 latency elevated
- User experience degraded
- Metrics show latency injection

**Source:** High latency scenario.

## Scenario 2: Payment Failures

### Objective

Test payment failure handling.

### Configuration

**Payment failure simulation:** Already enabled (10% rate)

### Steps

1. Make multiple payment requests
2. Observe failure rate (~10%)
3. Check metrics:
   - `payment_processed_total{status="failed"}`
   - `circuit_breaker_open_total`
4. Verify error handling
5. Test retry mechanisms

### Expected Results

- ~10% of payments fail
- Circuit breaker opens
- Error responses returned
- Metrics track failures

**Source:** Payment failure scenario in `server/routes/payments.ts`.

## Scenario 3: Combined Chaos

### Objective

Test system with multiple chaos conditions.

### Configuration

```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=200
```

**Plus:** Payment failure simulation (10%)

### Steps

1. Enable latency injection (200ms)
2. Make payment requests
3. Observe:
   - Latency impact
   - Payment failures
   - Combined metrics
4. Analyze system resilience

### Expected Results

- High latency on all requests
- Payment failures at ~10% rate
- Combined impact on metrics
- System handles both conditions

**Source:** Combined chaos scenario.

## Scenario 4: Gradual Latency Increase

### Objective

Test system with gradually increasing latency.

### Steps

1. Start with 50ms latency
2. Gradually increase: 100ms, 200ms, 500ms, 1000ms
3. At each step:
   - Make requests
   - Observe metrics
   - Check error rates
4. Identify breaking point

### Expected Results

- System handles low latency
- Degradation at higher latency
- Error rates increase
- Timeout thresholds reached

**Source:** Gradual latency scenario.

## Scenario 5: Chaos Event Frequency

### Objective

Test chaos event frequency and impact.

### Configuration

```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=100
```

### Steps

1. Enable chaos
2. Make many requests (100+)
3. Count chaos events
4. Verify ~10% event rate
5. Analyze `chaos_events_total` metric

### Expected Results

- ~10% of requests trigger chaos events
- `chaos_events_total` increments
- Random distribution
- Metrics track events

**Source:** Chaos event frequency scenario.

## Scenario Templates

### Scenario Template

**Title:** [Scenario Name]

**Objective:** [What to test]

**Configuration:**
```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=[value]
```

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Results:**
- [Result 1]
- [Result 2]

**Source:** Scenario template.

## Best Practices

### Scenario Design

**Principles:**
- Start simple
- Gradually increase complexity
- Document findings
- Learn from results

**Source:** Scenario design best practices.

### Safety

**Guidelines:**
- Test in non-production
- Have rollback plan
- Monitor closely
- Document everything

**Source:** Safety guidelines.

## Training vs Production

### Training Mode

**Use:** All scenarios for learning

**Focus:** Understanding chaos impact

### Production Mode

**Use:** Disabled

**Focus:** Real failure scenarios only

**Source:** Scenario mode differences.

## Next Steps

- [Chaos Overview](01-chaos-overview.md) - Chaos engineering overview
- [Chaos Configuration](02-chaos-configuration.md) - Configuration guide
- [Latency Injection](03-latency-injection.md) - Latency guide

