# Test Execution

Complete guide for executing tests and understanding test output.

## Test Commands

### Run All Tests

```bash
npm test
```

**Action:** Runs all tests in the project

**Source:** Test script in `package.json` line 23.

### Run E2E Tests Only

```bash
npm run test:e2e
```

**Action:** Runs only E2E tests

**Source:** E2E test script in `package.json` line 26.

### Run with Coverage

```bash
npm run test:coverage
```

**Action:** Runs tests and generates coverage report

**Source:** Coverage script in `package.json` line 25.

### Run in Watch Mode

```bash
npm run test:watch
```

**Action:** Runs tests in watch mode (re-runs on file changes)

**Source:** Watch script in `package.json` line 24.

### Run SRE Validation

```bash
npm run test:sre
```

**Action:** Runs SRE release gate validation

**Source:** SRE validation script in `package.json` line 27.

## Test Configuration

### Jest Configuration

**File:** `jest.config.ts`

**Settings:**
- Preset: `ts-jest`
- Test environment: `node`
- Test match: `**/*.test.ts`, `**/*.spec.ts`
- Timeout: 30000ms

**Source:** Jest configuration in `jest.config.ts`.

## Test Output

### Successful Test Run

**Output:**
```
PASS  tests/e2e/01-system-health.test.ts
PASS  tests/e2e/02-database-redis.test.ts
PASS  tests/e2e/03-products-crud.test.ts
...

Test Suites: 9 passed, 9 total
Tests:       45 passed, 45 total
```

**Source:** Jest test output format.

### Failed Test Run

**Output:**
```
FAIL  tests/e2e/03-products-crud.test.ts
  ● Products CRUD Operations › POST /api/products › should create a new product

    expect(received).toBe(expected)

    Expected: 201
    Received: 400
```

**Source:** Jest failure output format.

## Test Environment

### Required Environment

**Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional:**
- `CACHE_TYPE` (if testing Redis)
- `REDIS_URL` (if testing Redis)

**Source:** Environment requirements from test files.

### Test Setup

**File:** `tests/setup.ts`

**Purpose:** Global test setup

**Source:** Test setup file.

## Troubleshooting

### Tests Failing

**Common Issues:**
- Missing environment variables
- Database not accessible
- Redis not running (if using Redis)
- Port conflicts

**Solutions:**
- Check `.env` file
- Verify database connectivity
- Start Redis if needed
- Check port availability

**Source:** Common test issues.

### Timeout Issues

**Solution:**
- Increase timeout in `jest.config.ts`
- Check for slow operations
- Verify network connectivity

**Source:** Timeout configuration.

## CI/CD Integration

### GitHub Actions

**Example:**
```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

**Source:** CI/CD integration example.

## Training vs Production

### Training Mode

**Focus:** Learning test execution

**Use Case:** Understanding testing

### Production Mode

**Focus:** Release gates

**Use Case:** CI/CD validation

**Source:** Test execution modes.

## Next Steps

- [Test Strategy](02-test-strategy.md) - Testing strategy
- [E2E Tests](03-e2e-tests.md) - E2E test documentation
- [Test Coverage](05-test-coverage.md) - Coverage metrics

