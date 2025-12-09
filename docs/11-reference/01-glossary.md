# Glossary

Complete glossary of terms and concepts used in the BharatMart platform.

## A

### Adapter Pattern

**Definition:** Design pattern allowing interchangeable implementations of core components (database, cache, workers, secrets).

**Usage:** Enables switching between Supabase/PostgreSQL, Memory/Redis, In-process/Bull Queue without code changes.

**Source:** Adapter implementations in `server/adapters/` directory.

### API Gateway

**Definition:** Express.js backend server that handles all API requests.

**Location:** `server/app.ts`

**Source:** API gateway in `server/app.ts`.

## B

### BharatMart

**Definition:** Production-grade SRE training platform - an e-commerce application.

**Purpose:** Provides hands-on SRE training with real-world scenarios.

**Source:** Platform overview in `docs/01-getting-started/01-overview.md`.

### Bull Queue

**Definition:** Robust job queue system using Redis for persistence.

**Usage:** Background job processing with retry and reliability features.

**Source:** Bull Queue in `server/config/queue.ts`.

## C

### Chaos Engineering

**Definition:** Practice of intentionally injecting failures to test system resilience.

**Implementation:** Latency injection and failure simulation via middleware.

**Source:** Chaos engineering in `server/middleware/metricsMiddleware.ts`.

### Circuit Breaker

**Definition:** Pattern to prevent cascading failures by stopping requests when failure threshold is reached.

**Metric:** `circuit_breaker_open_total`

**Source:** Circuit breaker metric in `server/config/metrics.ts`.

## D

### Deployment Mode

**Definition:** Configuration determining how components are deployed (single-VM, multi-tier, Kubernetes).

**Configuration:** `DEPLOYMENT_MODE` environment variable

**Source:** Deployment modes in `server/config/deployment.ts` line 22.

## E

### Error Budget

**Definition:** Acceptable amount of unreliability, calculated as 1 - SLO target.

**Example:** SLO 99.9% → Error Budget 0.1%

**Source:** Error budgets in `docs/06-observability/08-slos-and-error-budgets.md`.

### E2E Tests

**Definition:** End-to-end tests validating complete system functionality.

**Location:** `tests/e2e/`

**Source:** E2E test suite in `tests/e2e/` directory.

## H

### Health Check

**Definition:** Endpoint to verify service is running and ready.

**Endpoints:** `/api/health` (liveness), `/api/health/ready` (readiness)

**Source:** Health endpoints in `server/routes/health.ts`.

## M

### Metrics

**Definition:** Quantitative measurements of system behavior exposed in Prometheus format.

**Endpoint:** `/metrics`

**Source:** Metrics in `server/config/metrics.ts`.

## O

### Observability

**Definition:** Three pillars: Metrics, Logs, and Traces for system visibility.

**Components:** Prometheus (metrics), Winston (logs), OpenTelemetry (traces)

**Source:** Observability in `docs/06-observability/01-observability-overview.md`.

## P

### Prometheus

**Definition:** Metrics collection and storage system.

**Format:** Prometheus text format

**Source:** Prometheus metrics in `server/config/metrics.ts`.

## R

### RLS (Row Level Security)

**Definition:** Database-level security policy controlling row-level access.

**Status:** Enabled on all tables

**Source:** RLS in `supabase/migrations/00000000000002_base_schema.sql` lines 144-149.

### RBAC (Role-Based Access Control)

**Definition:** Access control model based on user roles (admin, customer).

**Implementation:** Database roles and application-level checks

**Source:** RBAC in `src/contexts/AuthContext.tsx` line 11.

## S

### SLO (Service Level Objective)

**Definition:** Target reliability for a service (e.g., 99.9% availability).

**Examples:** Order success rate 99.9%, Payment success rate 99.5%

**Source:** SLOs in `docs/06-observability/08-slos-and-error-budgets.md`.

### Supabase

**Definition:** Managed PostgreSQL database and authentication service.

**Usage:** Default database and auth provider

**Source:** Supabase configuration in `server/config/supabase.ts`.

## T

### TTL (Time To Live)

**Definition:** Cache expiration time in seconds.

**Examples:** Product list 300s, Product detail 600s

**Source:** Cache TTL in route handlers.

## W

### Worker

**Definition:** Background job processor for asynchronous tasks.

**Types:** Email, Order, Payment workers

**Source:** Workers in `server/workers/` directory.

## Next Steps

- [Acronyms](02-acronyms.md) - Acronym reference
- [File Structure](03-file-structure.md) - Project structure
- [Code Organization](04-code-organization.md) - Code organization

