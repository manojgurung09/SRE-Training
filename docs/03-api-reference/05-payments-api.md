# Payments API

Complete reference for the Payments API endpoints.

## Base Path

```
/api/payments
```

**Source:** Route registration in `server/app.ts` line 48.

## List Payments

Get a paginated list of payments with optional filtering.

### Endpoint

```
GET /api/payments
```

**Source:** Route handler in `server/routes/payments.ts` lines 8-41.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by status (pending, completed, failed, refunded) |
| `order_id` | UUID | No | - | Filter by order ID |
| `limit` | number | No | 50 | Number of results per page |
| `offset` | number | No | 0 | Pagination offset |

**Source:** Query parameter parsing in `server/routes/payments.ts` line 10.

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "data": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "amount": 9998,
      "status": "completed",
      "payment_method": "credit_card",
      "transaction_id": "txn_1234567890_abc123",
      "processed_at": "2024-12-19T10:00:00.000Z",
      "created_at": "2024-12-19T10:00:00.000Z",
      "updated_at": "2024-12-19T10:00:00.000Z"
    }
  ],
  "count": 50,
  "limit": 50,
  "offset": 0
}
```

**Source:** Response format in `server/routes/payments.ts` lines 31-36.

## Get Payment by ID

Get a single payment by its ID, including order information.

### Endpoint

```
GET /api/payments/:id
```

**Source:** Route handler in `server/routes/payments.ts` lines 43-64.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Payment ID |

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "amount": 9998,
  "status": "completed",
  "payment_method": "credit_card",
  "transaction_id": "txn_1234567890_abc123",
  "orders": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "processing",
    "total_amount": 9998
  },
  "processed_at": "2024-12-19T10:00:00.000Z",
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `404 Not Found` (if payment doesn't exist)

**Body:**
```json
{
  "error": "Payment not found"
}
```

**Source:** Response handling in `server/routes/payments.ts` lines 55-57.

## Create Payment

Create a new payment. **⚠️ Training Mode:** Payment processing includes 10% random failure rate for training purposes.

### Endpoint

```
POST /api/payments
```

**Source:** Route handler in `server/routes/payments.ts` lines 66-126.

### Request Body

**Required Fields:**
- `order_id` (UUID) - Order ID
- `amount` (number) - Payment amount
- `payment_method` (string) - Payment method (e.g., "credit_card")

**Source:** Request body validation in `server/routes/payments.ts` lines 70-72.

### Response

**Status:** `201 Created`

**Body (Success):**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "amount": 9998,
  "status": "completed",
  "payment_method": "credit_card",
  "transaction_id": "txn_1234567890_abc123",
  "processed_at": "2024-12-19T10:00:00.000Z",
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Body (Failure - Training Mode):**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "amount": 9998,
  "status": "failed",
  "payment_method": "credit_card",
  "transaction_id": null,
  "processed_at": "2024-12-19T10:00:00.000Z",
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `400 Bad Request` (if required fields missing)

**Body:**
```json
{
  "error": "Missing required fields: order_id, amount, payment_method"
}
```

**Source:** Error handling in `server/routes/payments.ts` lines 70-72.

### Business Logic

1. **Failure Simulation:** 10% random failure rate (training mode)
   ```typescript
   const simulateFailure = Math.random() < 0.1;
   ```
2. **Status Determination:** Status is `failed` or `completed` based on simulation
3. **Transaction ID:** Generated only for successful payments: `txn_${Date.now()}_${random}`
4. **Order Update:** If payment succeeds, order status is updated to `processing`
5. **Metrics:** Payment metrics are incremented
6. **Circuit Breaker:** `circuitBreakerOpenTotal` is incremented on failure

**Source:** Payment processing logic in `server/routes/payments.ts` lines 74-103.

### Metrics

The following metrics are incremented on payment creation:

- `paymentProcessedTotal{status="completed|failed", payment_method="credit_card"}` - Payment counter
- `paymentValueTotal{status="completed|failed"}` - Payment value counter
- `circuitBreakerOpenTotal` - Circuit breaker counter (on failure)

**Source:** Metric increments in `server/routes/payments.ts` lines 79-80, 105-106.

### ⚠️ Training Mode Warning

**Payment failure simulation is enabled by default for training purposes.**

In production:
- Remove or disable failure simulation
- Integrate with real payment gateway
- Implement proper error handling and retries

**Source:** Failure simulation in `server/routes/payments.ts` line 74.

## Update Payment Status

Update the status of an existing payment.

### Endpoint

```
PATCH /api/payments/:id/status
```

**Source:** Route handler in `server/routes/payments.ts` lines 128-165.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Payment ID |

### Request Body

**Required Fields:**
- `status` (string) - New status

**Valid Statuses:**
- `pending`
- `completed`
- `failed`
- `refunded`

**Source:** Status validation in `server/routes/payments.ts` lines 133-136.

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "uuid",
  "status": "refunded",
  "processed_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `400 Bad Request` (if invalid status)

**Body:**
```json
{
  "error": "Invalid status"
}
```

**Status:** `404 Not Found` (if payment doesn't exist)

**Body:**
```json
{
  "error": "Payment not found"
}
```

**Source:** Response handling in `server/routes/payments.ts` lines 133-136, 156-158.

### Business Logic

- If status is `completed` or `failed`, `processed_at` timestamp is set

**Source:** Status update logic in `server/routes/payments.ts` lines 143-145.

## Payment Status Flow

```
pending → completed
       → failed
       → refunded (from completed)
```

**Source:** Valid statuses defined in `server/routes/payments.ts` line 133.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Missing required fields or invalid status |
| 404 | Payment not found |
| 500 | Internal server error (database error, etc.) |

**Source:** Error handling throughout `server/routes/payments.ts`.

## Test Examples

**Source:** E2E test examples in `tests/e2e/05-payments-crud.test.ts`:

- Payment creation: Lines 86-110
- Payment listing: Lines 127-136
- Payment filtering: Lines 138-147, 149-161
- Payment retrieval: Lines 164-192
- Payment status update: Lines 204-232
- Status validation: Lines 234-261

