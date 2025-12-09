# Testing Overview

Complete testing strategy and test execution guide.

## Testing Framework

**Framework:** Jest 29.7.0

**Test Runner:** ts-jest 29.1.1

**HTTP Testing:** Supertest 6.3.3

**Source:** Testing dependencies in `package.json` lines 71-73.

## Test Types

### E2E Tests

**Location:** `tests/e2e/`

**Purpose:** End-to-end validation of system components

**Coverage:**
- System health checks
- Database and Redis operations
- API CRUD operations
- Observability signals
- Chaos engineering
- Data integrity

**Source:** E2E test files in `tests/e2e/` directory.

### Test Files

1. `01-system-health.test.ts` - Health endpoints and environment validation
2. `02-database-redis.test.ts` - Database and Redis operations
3. `03-products-crud.test.ts` - Products API CRUD
4. `04-orders-crud.test.ts` - Orders API CRUD
5. `05-payments-crud.test.ts` - Payments API CRUD
6. `06-users-profiles.test.ts` - User and profile operations
7. `07-observability.test.ts` - Metrics, logs, traces
8. `08-chaos-engineering.test.ts` - Chaos engineering validation
9. `09-data-integrity.test.ts` - Data integrity and reliability

**Source:** Test file listing from `tests/e2e/` directory.

## Test Execution

### Run All Tests

```bash
npm test
```

**Source:** Test script in `package.json` line 23.

### Run E2E Tests Only

```bash
npm run test:e2e
```

**Source:** E2E test script in `package.json` line 26.

### Run with Coverage

```bash
npm run test:coverage
```

**Source:** Coverage script in `package.json` line 25.

### Watch Mode

```bash
npm run test:watch
```

**Source:** Watch script in `package.json` line 24.

## Test Configuration

### Jest Configuration

**File:** `jest.config.ts`

**Key Settings:**
- **Preset:** `ts-jest`
- **Test Environment:** `node`
- **Test Match:** `**/*.test.ts`, `**/*.spec.ts`
- **Test Timeout:** 30000ms (30 seconds)
- **Setup Files:** `tests/setup.ts`

**Source:** Jest configuration in `jest.config.ts`.

### Test Environment

**Required:**
- Node.js 20+
- Supabase database connection
- (Optional) Redis connection (if testing Redis features)

**Source:** Environment requirements from test files and `tests/e2e/01-system-health.test.ts`.

## Test Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \      ← Few, comprehensive tests
     /--------\
    /          \
   / Integration \  ← Medium coverage
  /--------------\
 /                \
/   Unit Tests     \  ← Many, focused tests
\------------------/
```

**Current Status:** E2E tests are the primary test type

**Source:** Test structure observed in `tests/e2e/` directory.

### Test Organization

**Structure:**
- `tests/e2e/` - E2E test files
- `tests/helpers/` - Test helper functions
- `tests/setup.ts` - Test setup configuration

**Source:** Test directory structure.

## Quality Gates

### SRE Release Gate

**Script:** `scripts/full-sre-e2e.js`

**Purpose:** Automated release gate that runs all E2E tests

**Execution:**
```bash
npm run test:sre
```

**Output:**
- `✅ SAFE TO DEPLOY` - All tests passed
- `❌ BLOCK RELEASE` - Tests failed

**Source:** SRE validation script in `scripts/full-sre-e2e.js`. Script execution in `package.json` line 27.

### Release Gate Logic

1. **Check Prerequisites:** Node.js, npm availability
2. **Check Environment:** `.env` file existence
3. **Run E2E Tests:** Execute all E2E tests
4. **Gate Decision:** Pass or block based on test results

**Source:** Release gate logic in `scripts/full-sre-e2e.js` lines 21-69.

## Test Coverage

### Current Coverage

**Type:** E2E test coverage

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

**Source:** Coverage based on test files in `tests/e2e/`.

### Coverage Goals

**Target:** Comprehensive E2E coverage of all system components

**Current:** 9 E2E test files covering major functionality

**Source:** Test file count and coverage from `tests/e2e/` directory.

## Test Data Management

### Test Helpers

**Location:** `tests/helpers/`

**Files:**
- `cleanup.ts` - Test data cleanup functions
- `test-data.ts` - Test data generation

**Source:** Helper files in `tests/helpers/` directory.

### Cleanup Strategy

Tests clean up after themselves:

- Delete test products
- Delete test orders
- Delete test payments
- Clean up Redis test keys

**Source:** Cleanup patterns in test files (e.g., `tests/e2e/03-products-crud.test.ts` lines 9-14).

## Training vs Production

### Training Mode

**Focus:** Learning test execution and validation

**Use Case:** SRE training, understanding test strategy

### Production Mode

**Focus:** Release gates and quality assurance

**Use Case:** CI/CD integration, pre-deployment validation

## CI/CD Integration

### Integration Points

1. **Pre-Commit:** Run tests before commit (optional)
2. **Pre-Deploy:** Run SRE validation script
3. **Post-Deploy:** Run smoke tests

**Source:** SRE validation script can be integrated into CI/CD pipelines.

## Next Steps

- [Test Strategy](02-test-strategy.md) - Detailed test strategy
- [E2E Tests](03-e2e-tests.md) - E2E test suite documentation
- [Test Execution](04-test-execution.md) - How to run tests
- [Test Coverage](05-test-coverage.md) - Coverage metrics and goals
- [Release Gates](06-release-gates.md) - Release gate configuration

