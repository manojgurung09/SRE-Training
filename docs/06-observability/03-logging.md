# Logging

Complete logging strategy and Winston configuration.

## Logging Framework

**Framework:** Winston 3.11

**Source:** Logger configuration in `server/config/logger.ts`.

## Log Format

**Format:** JSON (structured logging)

**Source:** Log format in `server/config/logger.ts` lines 5-10.

### Log Entry Structure

```json
{
  "timestamp": "2024-12-19 10:00:00",
  "level": "info",
  "message": "API Request",
  "service": "sre-training-platform",
  "environment": "development",
  "method": "GET",
  "path": "/api/products",
  "status_code": 200,
  "response_time_ms": 45,
  "eventType": "api_request"
}
```

**Source:** Log structure from `server/config/logger.ts` lines 54-60 and `server/middleware/logger.ts` lines 46-57.

## Log Levels

**Configurable via:** `LOG_LEVEL` environment variable

**Default:** `info`

**Available Levels:**
- `error` - Error events
- `warn` - Warning events
- `info` - Informational events
- `debug` - Debug events
- `silly` - Verbose debug events

**Source:** Log level configuration in `server/config/logger.ts` line 55.

## Log Outputs

### Console Transport

**Format:** Colorized, human-readable

**Example:**
```
2024-12-19 10:00:00 [info]: API Request {"method":"GET","path":"/api/products"}
```

**Source:** Console transport in `server/config/logger.ts` lines 23-35.

### File Transport

**Location:** Configurable via `LOG_FILE` environment variable

**Default:** `logs/api.log` (relative to project root)

**Format:** JSON (structured)

**Source:** File transport in `server/config/logger.ts` lines 38-52.

## Log File Configuration

### Environment Variable

**Variable:** `LOG_FILE`

**Example:**
```bash
LOG_FILE=/var/log/bharatmart/api.log
```

**Source:** Log file path in `server/config/logger.ts` lines 13-15.

### Directory Creation

Log directory is automatically created if it doesn't exist.

**Source:** Directory creation in `server/config/logger.ts` lines 18-21.

## Business Event Logging

### logBusinessEvent Function

**Purpose:** Log business events (orders, payments, etc.)

**Usage:**
```typescript
logBusinessEvent({
  type: 'order',
  action: 'created',
  metadata: {
    order_id: 'uuid',
    user_id: 'uuid',
    total_amount: 9998
  }
});
```

**Source:** Business event logging function in `server/config/logger.ts` lines 75-85.

### Business Event Examples

**Order Created:**
```json
{
  "level": "info",
  "message": "Business Event",
  "event_type": "order",
  "action": "created",
  "order_id": "uuid",
  "user_id": "uuid",
  "total_amount": 9998,
  "items_count": 2
}
```

**Source:** Order event logging in `server/routes/orders.ts` lines 135-145.

**Payment Processed:**
```json
{
  "level": "info",
  "message": "Business Event",
  "event_type": "payment",
  "action": "processed",
  "payment_id": "uuid",
  "order_id": "uuid",
  "amount": 9998,
  "status": "completed"
}
```

**Source:** Payment event logging in `server/routes/payments.ts` lines 108-119.

## API Request Logging

### Request Start Log

**Logged:** When request is received

**Fields:**
- `eventType: "api_request_start"`
- `method` - HTTP method
- `path` - Request path
- `user_agent` - User agent
- `ip` - Client IP
- `requestSize` - Request size in bytes
- `coldStart` - Boolean (first request after startup)

**Source:** Request start logging in `server/middleware/logger.ts` lines 19-27.

### Request Complete Log

**Logged:** When response is sent

**Fields:**
- `eventType: "api_request"`
- `method` - HTTP method
- `path` - Request path
- `status_code` - HTTP status code
- `response_time_ms` - Response time in milliseconds
- `requestSize` - Request size
- `responseSize` - Response size

**Source:** Request complete logging in `server/middleware/logger.ts` lines 46-57.

## Error Logging

### Exception Handlers

Winston automatically logs uncaught exceptions and unhandled promise rejections.

**Source:** Exception handlers in `server/config/logger.ts` lines 63-64.

### Error Log Format

```json
{
  "timestamp": "2024-12-19 10:00:00",
  "level": "error",
  "message": "Error creating order",
  "error": {
    "message": "Database connection failed",
    "stack": "Error: Database connection failed\n    at ..."
  }
}
```

**Source:** Error logging in `server/routes/orders.ts` line 163.

## Log Retention

**Current:** No automatic log rotation configured

**⚠️ Production Recommendation:** Implement log rotation to prevent disk space issues.

**Source:** No log rotation configuration found in `server/config/logger.ts`.

## Log Aggregation

**Current:** Logs are written to file and console

**⚠️ Production Recommendation:** Integrate with log aggregation service (e.g., ELK, Datadog, CloudWatch)

**Source:** Current logging setup in `server/config/logger.ts`.

## Test Examples

**Source:** E2E test examples in `tests/e2e/07-observability.test.ts`:

- Log file generation: Lines 52-80
- JSON log format: Lines 82-109
- Required log fields: Lines 111-145

