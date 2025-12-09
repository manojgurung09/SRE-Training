# Chaos Configuration

How to configure chaos engineering behavior.

## Environment Variables

### CHAOS_ENABLED

**Type:** Boolean (string: "true" or "false")

**Default:** Not set (chaos disabled)

**Purpose:** Enable or disable chaos engineering

**Example:**
```bash
CHAOS_ENABLED=true
```

**Source:** Chaos enabled check in `server/middleware/metricsMiddleware.ts` line 7.

### CHAOS_LATENCY_MS

**Type:** Number (milliseconds)

**Default:** 0 (no latency injection)

**Purpose:** Amount of latency to inject in milliseconds

**Example:**
```bash
CHAOS_LATENCY_MS=100
```

**Source:** Latency configuration in `server/middleware/metricsMiddleware.ts` line 8.

## Configuration Examples

### Training Mode

```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=50
```

**Effect:**
- Latency injection enabled
- 50ms latency added to requests
- 10% random chance of chaos event per request

**Source:** Chaos behavior in `server/middleware/metricsMiddleware.ts` lines 10-17.

### Production Mode

```bash
CHAOS_ENABLED=false
# or omit CHAOS_LATENCY_MS
```

**Effect:**
- No latency injection
- No chaos events
- Normal request processing

**Source:** Chaos disabled when `CHAOS_ENABLED` is not "true" in `server/middleware/metricsMiddleware.ts` line 7.

## Chaos Modes

### Latency Injection Mode

**When:** `CHAOS_ENABLED=true` AND `CHAOS_LATENCY_MS > 0`

**Behavior:**
- Every request has latency injected
- Latency amount = `CHAOS_LATENCY_MS`
- Metric `simulated_latency_ms` is set to latency value

**Source:** Latency injection in `server/middleware/metricsMiddleware.ts` lines 14-17.

### Event Tracking Mode

**When:** `CHAOS_ENABLED=true`

**Behavior:**
- 10% random chance of chaos event per request
- `chaos_events_total` metric is incremented on event

**Source:** Chaos event tracking in `server/middleware/metricsMiddleware.ts` lines 10-12.

## Safety Limits

**Current:** No hard limits configured

**⚠️ Production Recommendation:** Implement maximum latency limits and rate limiting for chaos events.

**Source:** No safety limits found in current implementation.

## Configuration Validation

**Current:** No validation (invalid values may cause errors)

**⚠️ Production Recommendation:** Validate configuration on startup.

**Source:** Configuration is read directly from environment variables without validation.

## Configuration Examples

### Example 1: Light Chaos (Training)

```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=10
```

**Use Case:** Light latency for training

### Example 2: Moderate Chaos (Training)

```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=100
```

**Use Case:** Moderate latency for resilience testing

### Example 3: Heavy Chaos (Training)

```bash
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=500
```

**Use Case:** Heavy latency for extreme scenario testing

### Example 4: Production (Chaos Disabled)

```bash
CHAOS_ENABLED=false
```

**Use Case:** Production deployment

## Best Practices

1. **Start Small:** Begin with low latency values
2. **Monitor Impact:** Watch metrics during chaos
3. **Test in Staging:** Never enable chaos in production without testing
4. **Have Rollback:** Be able to disable immediately
5. **Document Scenarios:** Document what you're testing

**Source:** Best practices based on chaos engineering principles.

## Test Examples

**Source:** E2E test examples in `tests/e2e/08-chaos-engineering.test.ts`:

- Configuration validation: Lines 80-110
- Latency injection: Lines 24-41
- Event tracking: Lines 62-78

