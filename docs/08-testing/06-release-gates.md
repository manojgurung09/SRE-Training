# Release Gates

Automated release gate criteria and SRE validation script.

## Release Gate Overview

**Script:** `scripts/full-sre-e2e.js`

**Purpose:** Automated validation before production deployment

**Decision:** `✅ SAFE TO DEPLOY` or `❌ BLOCK RELEASE`

**Source:** Release gate script in `scripts/full-sre-e2e.js`.

## Gate Criteria

### Prerequisites Check

1. **Node.js Available:** Verifies Node.js is installed
2. **npm Available:** Verifies npm is installed
3. **Environment File:** Checks for `.env` file (warns if missing)

**Source:** Prerequisites check in `scripts/full-sre-e2e.js` lines 21-42.

### Test Execution

**Command:** `npm test -- --testPathPattern=e2e --verbose`

**Tests Run:** All E2E tests in `tests/e2e/`

**Source:** Test execution in `scripts/full-sre-e2e.js` lines 47-52.

### Gate Decision

**Pass Condition:** All E2E tests pass

**Block Condition:** Any E2E test fails

**Source:** Gate decision logic in `scripts/full-sre-e2e.js` lines 54-69.

## Execution

### Command

```bash
npm run test:sre
```

**Source:** Script execution in `package.json` line 27.

### Windows Alternative

```bash
npm run test:sre:win
```

**Source:** Windows script in `package.json` line 28.

### Direct Execution

```bash
node scripts/full-sre-e2e.js
```

**Source:** Script is executable Node.js file.

## Output

### Success Output

```
==========================================
✅ SAFE TO DEPLOY

All E2E tests passed successfully.
The system is ready for production deployment.
```

**Source:** Success output in `scripts/full-sre-e2e.js` lines 55-60.

### Failure Output

```
==========================================
❌ BLOCK RELEASE

One or more E2E tests failed.
Please fix the issues before deploying to production.
```

**Source:** Failure output in `scripts/full-sre-e2e.js` lines 62-68.

## Test Coverage

### E2E Test Suite

The release gate runs all E2E tests:

1. **System Health** (`01-system-health.test.ts`)
   - Environment variables
   - Health endpoints
   - Readiness checks

2. **Database & Redis** (`02-database-redis.test.ts`)
   - Database operations
   - Redis operations

3. **Products API** (`03-products-crud.test.ts`)
   - Product CRUD operations

4. **Orders API** (`04-orders-crud.test.ts`)
   - Order CRUD operations
   - SLO metrics validation

5. **Payments API** (`05-payments-crud.test.ts`)
   - Payment CRUD operations

6. **Users & Profiles** (`06-users-profiles.test.ts`)
   - User operations
   - Profile management

7. **Observability** (`07-observability.test.ts`)
   - Metrics endpoint
   - Log file generation
   - Trace configuration

8. **Chaos Engineering** (`08-chaos-engineering.test.ts`)
   - Chaos configuration
   - Latency injection
   - Event tracking

9. **Data Integrity** (`09-data-integrity.test.ts`)
   - Data relationships
   - Cache cleanup
   - Idempotency
   - Concurrent access

**Source:** Test files in `tests/e2e/` directory.

## Pre-Deployment Checks

### Automated Checks

1. ✅ Node.js and npm availability
2. ✅ Environment configuration
3. ✅ All E2E tests pass
4. ✅ System health endpoints
5. ✅ Database connectivity
6. ✅ API functionality
7. ✅ Observability signals
8. ✅ Data integrity

**Source:** Checks performed by E2E test suite.

## Deployment Readiness

### Criteria

**System is ready for deployment when:**
- All E2E tests pass
- Health endpoints respond correctly
- Database operations work
- API endpoints function
- Observability signals are generated
- No data integrity issues

**Source:** Criteria based on E2E test coverage.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Release Gate
on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:sre
```

**Source:** Integration example based on script execution.

### GitLab CI Example

```yaml
release_gate:
  script:
    - npm install
    - npm run test:sre
  only:
    - main
```

**Source:** Integration example based on script execution.

## Manual Validation

### Before Deployment

1. **Run Release Gate:**
   ```bash
   npm run test:sre
   ```

2. **Verify Output:** Ensure `✅ SAFE TO DEPLOY` message

3. **Review Failures:** If blocked, review test failures and fix issues

**Source:** Manual validation process based on script output.

## Training Use Cases

### SRE Training

- **Release Gate Labs:** Practice running release gates
- **Gate Failure Scenarios:** Learn to diagnose and fix gate failures
- **Deployment Readiness:** Understand deployment criteria

**Source:** Release gate is part of SRE training curriculum.

## Production Best Practices

1. **Always Run Before Deploy:** Never skip release gate
2. **Fix Before Deploy:** Don't deploy with failing tests
3. **Monitor Gate Results:** Track gate pass/fail rates
4. **Update Tests:** Keep tests aligned with code changes

**Source:** Best practices for production use.

## Test Examples

**Source:** E2E test examples in `tests/e2e/`:

- All 9 test files are executed by release gate
- Each test file validates specific system components
- Combined coverage ensures system readiness

