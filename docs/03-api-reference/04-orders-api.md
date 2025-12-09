# Orders API

Complete reference for the Orders API endpoints.

## Base Path

```
/api/orders
```

**Source:** Route registration in `server/app.ts` line 47.

## List Orders

Get a paginated list of orders with optional filtering.

### Endpoint

```
GET /api/orders
```

**Source:** Route handler in `server/routes/orders.ts` lines 10-43.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by status (pending, processing, shipped, delivered, cancelled) |
| `user_id` | UUID | No | - | Filter by user ID |
| `limit` | number | No | 50 | Number of results per page |
| `offset` | number | No | 0 | Pagination offset |

**Source:** Query parameter parsing in `server/routes/orders.ts` line 12.

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "status": "pending",
      "total_amount": 9998,
      "shipping_address": "123 Main St",
      "created_at": "2024-12-19T10:00:00.000Z",
      "updated_at": "2024-12-19T10:00:00.000Z"
    }
  ],
  "count": 50,
  "limit": 50,
  "offset": 0
}
```

**Source:** Response format in `server/routes/orders.ts` lines 33-38.

### Caching

**TTL:** 60 seconds (1 minute)

**Cache Key:** `orders:GET:/api/orders?status=pending&limit=50&offset=0`

**Source:** Cache middleware configuration in `server/routes/orders.ts` line 10.

## Get Order by ID

Get a single order by its ID, including order items and payment information.

### Endpoint

```
GET /api/orders/:id
```

**Source:** Route handler in `server/routes/orders.ts` lines 45-85.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Order ID |

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "status": "pending",
  "total_amount": 9998,
  "shipping_address": "123 Main St",
  "items": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 4999,
      "products": {
        "id": "uuid",
        "name": "Product Name",
        "price": 4999
      }
    }
  ],
  "payment": {
    "id": "uuid",
    "order_id": "uuid",
    "amount": 9998,
    "status": "completed",
    "payment_method": "credit_card"
  },
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `404 Not Found` (if order doesn't exist)

**Body:**
```json
{
  "error": "Order not found"
}
```

**Source:** Response handling in `server/routes/orders.ts` lines 57-59, 76-80.

### Caching

**TTL:** 120 seconds (2 minutes)

**Cache Key:** `order:GET:/api/orders/:id`

**Source:** Cache middleware configuration in `server/routes/orders.ts` line 45.

## Create Order

Create a new order with items.

### Endpoint

```
POST /api/orders
```

**Source:** Route handler in `server/routes/orders.ts` lines 87-167.

### Request Body

**Required Fields:**
- `user_id` (UUID) - User ID
- `items` (array) - Array of order items

**Order Item Structure:**
- `product_id` (UUID) - Product ID
- `quantity` (number) - Quantity
- `unit_price` (number) - Unit price

**Optional Fields:**
- `shipping_address` (string) - Shipping address

**Source:** Request body validation in `server/routes/orders.ts` lines 89-93.

### Response

**Status:** `201 Created`

**Body:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "status": "pending",
  "total_amount": 9998,
  "shipping_address": "123 Main St",
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `400 Bad Request` (if required fields missing)

**Body:**
```json
{
  "error": "Missing required fields: user_id, items"
}
```

**Source:** Error handling in `server/routes/orders.ts` lines 91-93.

### Business Logic

1. **Total Calculation:** Total amount is calculated from product prices and quantities
2. **Order Creation:** Order is created with status `pending`
3. **Order Items:** Order items are inserted into `order_items` table
4. **Metrics:** `orders_created_total` and `orderValueTotal` are incremented
5. **Queue Job:** Order is added to processing queue
6. **Cache Invalidation:** Order caches are invalidated

**Source:** Order creation logic in `server/routes/orders.ts` lines 95-156.

### Metrics

The following metrics are incremented on order creation:

- `orders_created_total{status="pending"}` - Order creation counter
- `orderValueTotal` - Total order value counter
- `orders_success_total` - Success counter (on successful response)

**Source:** Metric increments in `server/routes/orders.ts` lines 132-133, 161.

### Queue Integration

After order creation, a job is added to the order processing queue:

```typescript
queueService.addOrderToQueue({
  orderId: order.id,
  userId: user_id,
  totalAmount,
  items: [...]
})
```

**Source:** Queue integration in `server/routes/orders.ts` lines 147-156.

## Update Order Status

Update the status of an existing order.

### Endpoint

```
PATCH /api/orders/:id/status
```

**Source:** Route handler in `server/routes/orders.ts` lines 169-209.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Order ID |

### Request Body

**Required Fields:**
- `status` (string) - New status

**Valid Statuses:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Source:** Status validation in `server/routes/orders.ts` lines 174-177.

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "uuid",
  "status": "processing",
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

**Status:** `404 Not Found` (if order doesn't exist)

**Body:**
```json
{
  "error": "Order not found"
}
```

**Source:** Response handling in `server/routes/orders.ts` lines 174-177, 197-199.

### Business Logic

- If status is `processing` or `shipped`, `processed_at` timestamp is set
- Cache is invalidated after status update

**Source:** Status update logic in `server/routes/orders.ts` lines 184-186, 201-202.

## Order Status Flow

```
pending → processing → shipped → delivered
                ↓
            cancelled
```

**Source:** Valid statuses defined in `server/routes/orders.ts` line 174.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Missing required fields or invalid status |
| 404 | Order not found |
| 500 | Internal server error (database error, etc.) |

**Source:** Error handling throughout `server/routes/orders.ts`.

## Test Examples

**Source:** E2E test examples in `tests/e2e/04-orders-crud.test.ts`:

- Order creation: Lines 57-84
- Order listing: Lines 129-138
- Order filtering: Lines 140-149, 151-158
- Order retrieval: Lines 161-197
- Order status update: Lines 209-243
- Status validation: Lines 245-279
- SLO metrics: Lines 281-309

