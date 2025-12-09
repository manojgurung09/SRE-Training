# Failure Simulation

Complete guide to failure simulation in chaos engineering.

## Overview

**Purpose:** Simulate system failures for resilience testing

**Types:**
- Payment failures
- Database failures (via chaos)
- Network failures (via latency)

**Source:** Failure simulation in `server/routes/payments.ts` lines 74-81.

## Payment Failure Simulation

### Implementation

**Location:** `server/routes/payments.ts`

**Mechanism:**
```typescript
const simulateFailure = Math.random() < 0.1;
const paymentStatus = simulateFailure ? 'failed' : 'completed';
```

**Failure Rate:** 10% (0.1 probability)

**Source:** Payment failure simulation in `server/routes/payments.ts` lines 74-76.

### Failure Behavior

**When Failure Occurs:**
- Payment status set to 'failed'
- Transaction ID set to null
- Circuit breaker metric incremented
- Error logged

**Source:** Failure behavior in `server/routes/payments.ts` lines 79-81.

### Metrics

**Circuit Breaker Opens:**
- Metric: `circuit_breaker_open_total`
- Incremented on payment failure

**Payment Processed:**
- Metric: `payment_processed_total{status="failed"}`
- Tracks failed payments

**Source:** Failure metrics in `server/routes/payments.ts` lines 80, 105.

## Chaos Event Simulation

### Random Chaos Events

**Implementation:**
```typescript
if (chaosEnabled && Math.random() < 0.1) {
  chaosEventsTotal.inc();
}
```

**Probability:** 10% (0.1)

**Metric:** `chaos_events_total`

**Source:** Chaos events in `server/middleware/metricsMiddleware.ts` lines 10-12.

## Failure Scenarios

### Payment Failure

**Scenario:** Payment processing fails

**Impact:**
- Payment status: failed
- Order status: remains pending
- Customer experience: payment error

**Source:** Payment failure scenario.

### High Latency (Simulated Failure)

**Scenario:** High latency causes timeouts

**Impact:**
- Request timeouts
- User experience degradation
- Potential errors

**Source:** Latency failure scenario.

## Monitoring Failures

### Metrics

**Payment Failures:**
- `payment_processed_total{status="failed"}`
- `circuit_breaker_open_total`

**Chaos Events:**
- `chaos_events_total`

**Error Rate:**
- `http_requests_total{status_code=~"5.."}`

**Source:** Failure metrics.

### Logs

**Payment Failures:**
- Business event logs
- Error logs

**Chaos Events:**
- Request logs
- Metrics logs

**Source:** Failure logging.

## Testing Resilience

### Failure Injection Testing

**Steps:**
1. Enable failure simulation
2. Make requests
3. Observe failure rate
4. Test error handling
5. Verify recovery

**Source:** Resilience testing.

### Recovery Testing

**Steps:**
1. Inject failures
2. Verify error handling
3. Test retry mechanisms
4. Verify system recovery

**Source:** Recovery testing.

## Best Practices

### Failure Simulation

**Guidelines:**
- Use realistic failure rates
- Test error handling
- Monitor impact
- Document findings

**Source:** Best practices.

### Production Warning

**⚠️ Remove Failure Simulation in Production:**
- Payment failure simulation is for training only
- Remove `Math.random() < 0.1` logic
- Use real payment gateway
- Implement proper error handling

**Source:** Production safety warning.

## Training vs Production

### Training Mode

**Use:** Enable for learning

**Failure Rate:** 10% (configurable)

**Source:** Training mode usage.

### Production Mode

**Use:** Disabled

**Implementation:** Real payment gateway integration

**Source:** Production mode requirement.

## Next Steps

- [Chaos Overview](01-chaos-overview.md) - Chaos engineering overview
- [Latency Injection](03-latency-injection.md) - Latency injection guide
- [Chaos Metrics](05-chaos-metrics.md) - Metrics documentation

