# Overview

**BharatMart** is a production-grade Node.js e-commerce platform designed for both production deployment and SRE training. The platform demonstrates enterprise architecture patterns with full observability, chaos engineering capabilities, and flexible infrastructure adapters.

## What is BharatMart?

BharatMart is a multi-tier e-commerce application built with:

- **Frontend:** React 18.3 + TypeScript + Vite
- **Backend:** Express.js 4.18 + Node.js 20+ + TypeScript
- **Database:** Supabase (managed PostgreSQL) with adapter support for PostgreSQL and OCI Autonomous
- **Cache:** Memory or Redis (configurable)
- **Queue:** In-process, Bull Queue with Redis, or OCI Queue (configurable)
- **Observability:** Prometheus metrics, Winston logging, OpenTelemetry tracing
- **Chaos Engineering:** Built-in latency injection and failure simulation

## Key Features

### Production Features

- **Multi-Tier Architecture:** Frontend, API Gateway, Database, Cache, Workers, Observability
- **Adapter Pattern:** Switch databases, caches, queues via environment variables
- **Full Observability:** Metrics, logs, and distributed tracing
- **Background Workers:** Email, order processing, and payment workers
- **Auto-Scaling Ready:** Supports single-VM, multi-tier, and Kubernetes deployments
- **Health Checks:** Liveness and readiness probes for orchestration

### SRE Training Features

- **Chaos Engineering:** Configurable latency injection and failure simulation
- **Incident Simulation:** Pre-built scenarios for training
- **Comprehensive Testing:** E2E test suite covering all system components
- **Release Gates:** Automated SRE validation script
- **Observability Labs:** Hands-on exercises with metrics, logs, and traces

## Use Cases

### Training Mode

The platform includes intentionally relaxed security and failure simulation for SRE training:

- **Chaos Engineering:** Enable `CHAOS_ENABLED=true` to inject latency and failures
- **Failure Simulation:** Payment processing includes 10% random failure rate (configurable)
- **Training Scenarios:** Pre-built incident simulation labs
- **Learning Path:** 5-day SRE training curriculum

**⚠️ Training Mode Warning:** Some behaviors (e.g., payment failure simulation) are intentionally relaxed for training. Review security documentation before production deployment.

### Production Mode

For production use:

- **Security:** Supabase Auth with Row Level Security (RLS)
- **Reliability:** Retry mechanisms, circuit breakers, error handling
- **Observability:** Full metrics, logging, and tracing
- **Scalability:** Auto-scaling support for all tiers
- **Deployment:** Multiple deployment modes (VM, Docker, Kubernetes)

## Documentation Navigation

- **New to the platform?** Start with [Quick Start](02-quick-start.md)
- **Understanding architecture?** See [Architecture Overview](03-architecture-overview.md)
- **Deploying to production?** See [Deployment Guides](../05-deployment/)
- **SRE Training?** See [SRE Training](../09-sre-training/)
- **Troubleshooting?** See [Troubleshooting](../10-troubleshooting/)

## Quick Start Options

1. **5-Minute Local Setup:** [Quick Start Guide](02-quick-start.md) - Get running locally with Supabase
2. **Production Deployment:** [Deployment Overview](../05-deployment/01-deployment-overview.md) - Deploy to production
3. **SRE Training:** [Training Overview](../09-sre-training/01-training-overview.md) - Start 5-day training course
4. **API Integration:** [API Reference](../03-api-reference/01-api-overview.md) - Integrate with the API

## Technology Stack

**Frontend:**
- React 18.3
- TypeScript 5.5
- Vite 5.4
- Tailwind CSS 3.4

**Backend:**
- Express.js 4.18
- Node.js 20+
- TypeScript
- Winston (logging)
- Prometheus Client (metrics)
- OpenTelemetry (tracing)

**Infrastructure:**
- Supabase (database & auth)
- Redis (cache & queue)
- Bull Queue (job processing)
- Prometheus (metrics)
- OpenTelemetry (tracing)

## Code-Driven Documentation

All documentation in this repository is generated directly from the codebase. Every technical claim is verifiable in:

- `server/routes/` - API endpoints
- `server/middleware/` - Request processing
- `server/adapters/` - Infrastructure adapters
- `server/workers/` - Background jobs
- `server/config/` - Configuration
- `tests/e2e/` - E2E test suite

**Source of Truth:** The code is the single source of truth. Documentation reflects actual implementation.

