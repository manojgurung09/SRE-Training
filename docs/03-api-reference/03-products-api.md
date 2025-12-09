# Products API

Complete reference for the Products API endpoints.

## Base Path

```
/api/products
```

**Source:** Route registration in `server/app.ts` line 46.

## List Products

Get a paginated list of products with optional filtering.

### Endpoint

```
GET /api/products
```

**Source:** Route handler in `server/routes/products.ts` lines 7-40.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | - | Filter by category |
| `search` | string | No | - | Search in name, description, SKU |
| `limit` | number | No | 50 | Number of results per page |
| `offset` | number | No | 0 | Pagination offset |

**Source:** Query parameter parsing in `server/routes/products.ts` line 9.

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 4999,
      "category": "electronics",
      "stock_quantity": 100,
      "sku": "PROD-001",
      "image_url": "https://...",
      "is_active": true,
      "created_at": "2024-12-19T10:00:00.000Z",
      "updated_at": "2024-12-19T10:00:00.000Z"
    }
  ],
  "count": 100,
  "limit": 50,
  "offset": 0
}
```

**Source:** Response format in `server/routes/products.ts` lines 30-35.

### Example Request

```bash
curl "http://localhost:3000/api/products?category=electronics&limit=10&offset=0"
```

### Caching

**TTL:** 300 seconds (5 minutes)

**Cache Key:** `products:GET:/api/products?category=electronics&limit=10&offset=0`

**Source:** Cache middleware configuration in `server/routes/products.ts` line 7.

## Get Product by ID

Get a single product by its ID.

### Endpoint

```
GET /api/products/:id
```

**Source:** Route handler in `server/routes/products.ts` lines 42-63.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Product ID |

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Product description",
  "price": 4999,
  "category": "electronics",
  "stock_quantity": 100,
  "sku": "PROD-001",
  "image_url": "https://...",
  "is_active": true,
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `404 Not Found` (if product doesn't exist)

**Body:**
```json
{
  "error": "Product not found"
}
```

**Source:** Response handling in `server/routes/products.ts` lines 54-56.

### Example Request

```bash
curl "http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000"
```

### Caching

**TTL:** 600 seconds (10 minutes)

**Cache Key:** `product:GET:/api/products/:id`

**Source:** Cache middleware configuration in `server/routes/products.ts` line 42.

## Create Product

Create a new product.

### Endpoint

```
POST /api/products
```

**Source:** Route handler in `server/routes/products.ts` lines 65-95.

### Request Body

**Required Fields:**
- `name` (string) - Product name
- `price` (number) - Product price
- `category` (string) - Product category

**Optional Fields:**
- `description` (string) - Product description
- `stock_quantity` (number) - Stock quantity (default: 0)
- `sku` (string) - SKU code

**Source:** Request body validation in `server/routes/products.ts` lines 67-71.

### Response

**Status:** `201 Created`

**Body:**
```json
{
  "id": "uuid",
  "name": "New Product",
  "description": "Product description",
  "price": 4999,
  "category": "electronics",
  "stock_quantity": 100,
  "sku": "PROD-002",
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `400 Bad Request` (if required fields missing)

**Body:**
```json
{
  "error": "Missing required fields: name, price, category"
}
```

**Source:** Error handling in `server/routes/products.ts` lines 69-71.

### Example Request

```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 4999,
    "category": "electronics",
    "stock_quantity": 100,
    "sku": "PROD-002"
  }'
```

### Cache Invalidation

After successful creation, cache is invalidated:
- `products:*` - All product list caches
- `product:*:${id}` - Product detail cache

**Source:** Cache invalidation in `server/routes/products.ts` line 88.

## Update Product

Update an existing product.

### Endpoint

```
PUT /api/products/:id
```

**Source:** Route handler in `server/routes/products.ts` lines 97-132.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Product ID |

### Request Body

All fields are optional (partial update):

- `name` (string)
- `description` (string)
- `price` (number)
- `category` (string)
- `stock_quantity` (number)
- `sku` (string)

**Source:** Update logic in `server/routes/products.ts` lines 102-109.

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "uuid",
  "name": "Updated Product Name",
  "price": 5999,
  "updated_at": "2024-12-19T10:00:00.000Z"
}
```

**Status:** `404 Not Found` (if product doesn't exist)

**Body:**
```json
{
  "error": "Product not found"
}
```

**Source:** Response handling in `server/routes/products.ts` lines 120-122.

### Example Request

```bash
curl -X PUT "http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "price": 5999
  }'
```

### Cache Invalidation

After successful update, cache is invalidated:
- `products:*` - All product list caches
- `product:*:${id}` - Product detail cache

**Source:** Cache invalidation in `server/routes/products.ts` lines 124-125.

## Delete Product

Delete a product.

### Endpoint

```
DELETE /api/products/:id
```

**Source:** Route handler in `server/routes/products.ts` lines 134-150.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Product ID |

### Response

**Status:** `204 No Content` (successful deletion)

**Source:** Response in `server/routes/products.ts` line 145.

### Example Request

```bash
curl -X DELETE "http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000"
```

### Cache Invalidation

After successful deletion, cache is invalidated:
- `products:*` - All product list caches
- `product:*:${id}` - Product detail cache

**Source:** Cache invalidation in `server/routes/products.ts` lines 142-143.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Missing required fields |
| 404 | Product not found |
| 500 | Internal server error (database error, etc.) |

**Source:** Error handling throughout `server/routes/products.ts`.

## Test Examples

**Source:** E2E test examples in `tests/e2e/03-products-crud.test.ts`:

- Product creation: Lines 17-37
- Product listing: Lines 54-63
- Product filtering: Lines 65-74
- Product search: Lines 76-83
- Product pagination: Lines 85-94
- Product retrieval: Lines 97-123
- Product update: Lines 135-167
- Product deletion: Lines 182-220

