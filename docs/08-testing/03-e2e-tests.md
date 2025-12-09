# E2E Tests

Detailed documentation of the E2E test suite.

## Overview

**Location:** `tests/e2e/`

**Framework:** Jest + Supertest

**Purpose:** End-to-end validation of all system components

**Source:** E2E test files in `tests/e2e/` directory.

## Test Suite Structure

### 01-system-health.test.ts

**Purpose:** Validate system health and environment

**Tests:**
- Environment variable validation
- Health endpoint (`/api/health`)
- Readiness endpoint (`/api/health/ready`)

**Source:** System health tests in `tests/e2e/01-system-health.test.ts`.

### 02-database-redis.test.ts

**Purpose:** Validate database and Redis operations

**Tests:**
- Database CRUD operations
- Redis operations
- Connection validation

**Source:** Database/Redis tests in `tests/e2e/02-database-redis.test.ts`.

### 03-products-crud.test.ts

**Purpose:** Validate Products API

**Tests:**
- `POST /api/products` - Create product
- `GET /api/products` - List products (with filters, pagination)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Source:** Products API tests in `tests/e2e/03-products-crud.test.ts`.

### 04-orders-crud.test.ts

**Purpose:** Validate Orders API

**Tests:**
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status
- SLO metrics validation

**Source:** Orders API tests in `tests/e2e/04-orders-crud.test.ts`.

### 05-payments-crud.test.ts

**Purpose:** Validate Payments API

**Tests:**
- `POST /api/payments` - Create payment
- `GET /api/payments` - List payments (with filters)
- `GET /api/payments/:id` - Get payment by ID
- `PATCH /api/payments/:id/status` - Update payment status
- Failure simulation validation

**Source:** Payments API tests in `tests/e2e/05-payments-crud.test.ts`.

### 06-users-profiles.test.ts

**Purpose:** Validate user and profile operations

**Tests:**
- User creation
- Profile read
- Profile update
- Security boundary validation

**Source:** Users/profiles tests in `tests/e2e/06-users-profiles.test.ts`.

### 07-observability.test.ts

**Purpose:** Validate observability signals

**Tests:**
- Metrics endpoint (`/metrics`)
- Log file generation
- JSON log format
- Trace configuration

**Source:** Observability tests in `tests/e2e/07-observability.test.ts`.

### 08-chaos-engineering.test.ts

**Purpose:** Validate chaos engineering

**Tests:**
- Chaos latency injection
- Chaos events counter
- Chaos configuration

**Source:** Chaos engineering tests in `tests/e2e/08-chaos-engineering.test.ts`.

### 09-data-integrity.test.ts

**Purpose:** Validate data integrity

**Tests:**
- Order-product relationships
- Redis cache cleanup
- Idempotency
- Concurrent access safety

**Source:** Data integrity tests in `tests/e2e/09-data-integrity.test.ts`.

## Test Helpers

### Cleanup Functions

**Location:** `tests/helpers/cleanup.ts`

**Functions:**
- `cleanupTestProduct(id)` - Clean up test product
- `cleanupTestOrder(id)` - Clean up test order
- `cleanupTestPayment(id)` - Clean up test payment

**Source:** Cleanup helpers in `tests/helpers/cleanup.ts`.

### Test Data

**Location:** `tests/helpers/test-data.ts`

**Functions:**
- Test data generation
- Test user creation
- Test product creation

**Source:** Test data helpers.

## Test Execution

### Run All E2E Tests

```bash
npm run test:e2e
```

**Source:** E2E test script in `package.json` line 26.

### Run Specific Test File

```bash
npm test -- tests/e2e/03-products-crud.test.ts
```

**Source:** Jest test execution.

### Run with Verbose Output

```bash
npm test -- --verbose --testPathPattern=e2e
```

**Source:** Jest verbose mode.

## Test Coverage

### Current Coverage

**Areas Covered:**
- ✅ System health
- ✅ Database operations
- ✅ Redis operations
- ✅ Products API
- ✅ Orders API
- ✅ Payments API
- ✅ Users and profiles
- ✅ Observability
- ✅ Chaos engineering
- ✅ Data integrity

**Source:** Coverage based on test files.

## Best Practices

### Test Isolation

**Principles:**
- Each test is independent
- Clean up test data
- Use unique identifiers
- Avoid test interdependencies

**Source:** Test isolation in test files.

### Test Data Management

**Strategy:**
- Create test data in `beforeAll`/`beforeEach`
- Clean up in `afterAll`/`afterEach`
- Use timestamps for uniqueness
- Clean up even on failure

**Source:** Test data management patterns.

## Training vs Production

### Training Mode

**Focus:** Learning test execution

**Use Case:** Understanding E2E testing

### Production Mode

**Focus:** Release gates and validation

**Use Case:** CI/CD integration

**Source:** Testing mode differences.

## Next Steps

- [Test Strategy](02-test-strategy.md) - Testing strategy
- [Test Execution](04-test-execution.md) - How to run tests
- [Test Coverage](05-test-coverage.md) - Coverage metrics

