# BharatMart - SRE Training Platform

Production-grade Node.js + Express + Supabase + Redis + Prometheus + OpenTelemetry + Chaos Engineering SRE training platform.

## Overview

BharatMart is a comprehensive e-commerce platform designed specifically for Site Reliability Engineering (SRE) training. It provides hands-on experience with production-grade observability, chaos engineering, incident response, and reliability practices.

**Key Features:**
- Multi-tier architecture with configurable adapters
- Complete observability stack (metrics, logs, traces)
- Chaos engineering for resilience testing
- Comprehensive E2E test suite
- Multiple deployment modes (single-VM, multi-tier, Kubernetes)
- SRE training curriculum (5-day course)

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Supabase account (for database)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
git checkout <branch-name>

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development servers
npm run dev:server                                # Terminal 1 - Backend
npm run dev -- --host 0.0.0.0 --port 5173         # Terminal 2 - Frontend
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Metrics: http://localhost:3000/metrics

**Source:** Quick start guide in `docs/01-getting-started/02-quick-start.md`.

## Documentation

Complete documentation is available in the `docs/` directory:

### Getting Started
- [Overview](docs/01-getting-started/01-overview.md) - Platform overview
- [Quick Start](docs/01-getting-started/02-quick-start.md) - Setup guide
- [Architecture Overview](docs/01-getting-started/03-architecture-overview.md) - System architecture
- [Prerequisites](docs/01-getting-started/04-prerequisites.md) - Requirements

### Architecture
- [System Architecture](docs/02-architecture/01-system-architecture.md) - Complete system design
- [Backend Architecture](docs/02-architecture/02-backend-architecture.md) - Express.js backend
- [Frontend Architecture](docs/02-architecture/03-frontend-architecture.md) - React frontend
- [Database Architecture](docs/02-architecture/04-database-architecture.md) - Database design
- [Cache Architecture](docs/02-architecture/05-cache-architecture.md) - Caching strategy
- [Worker Architecture](docs/02-architecture/06-worker-architecture.md) - Background workers
- [Deployment Modes](docs/02-architecture/07-deployment-modes.md) - Deployment configurations
- [Worker Reliability Model](docs/02-architecture/08-worker-reliability-model.md) - Reliability semantics

### API Reference
- [API Overview](docs/03-api-reference/01-api-overview.md) - API introduction
- [Authentication](docs/03-api-reference/02-authentication.md) - Auth model
- [Products API](docs/03-api-reference/03-products-api.md) - Products endpoints
- [Orders API](docs/03-api-reference/04-orders-api.md) - Orders endpoints
- [Payments API](docs/03-api-reference/05-payments-api.md) - Payments endpoints
- [Health API](docs/03-api-reference/06-health-api.md) - Health checks
- [Metrics API](docs/03-api-reference/07-metrics-api.md) - Prometheus metrics

### Configuration
- [Environment Variables](docs/04-configuration/01-environment-variables.md) - Complete env var reference
- [Database Adapters](docs/04-configuration/02-database-adapters.md) - Database configuration
- [Cache Adapters](docs/04-configuration/03-cache-adapters.md) - Cache configuration
- [Worker Adapters](docs/04-configuration/04-worker-adapters.md) - Worker configuration
- [Secrets Management](docs/04-configuration/05-secrets-management.md) - Secrets handling
- [Deployment Configuration](docs/04-configuration/06-deployment-configuration.md) - Deployment settings

### Deployment
- [Deployment Overview](docs/05-deployment/01-deployment-overview.md) - Deployment options
- [Local Development](docs/05-deployment/02-local-development.md) - Local setup
- [Single-VM Deployment](docs/05-deployment/03-single-vm-deployment.md) - Single VM setup
- [Multi-Tier Deployment](docs/05-deployment/04-multi-tier-deployment.md) - Multi-tier setup
- [Kubernetes Deployment](docs/05-deployment/05-kubernetes-deployment.md) - Kubernetes setup
- [Docker Deployment](docs/05-deployment/06-docker-deployment.md) - Docker setup
- [OCI Deployment](docs/05-deployment/07-oci-deployment.md) - Oracle Cloud setup
- [Scaling Guide](docs/05-deployment/08-scaling-guide.md) - Scaling strategies

### Observability
- [Observability Overview](docs/06-observability/01-observability-overview.md) - Three pillars
- [Metrics](docs/06-observability/02-metrics.md) - Prometheus metrics
- [Logging](docs/06-observability/03-logging.md) - Structured logging
- [Tracing](docs/06-observability/04-tracing.md) - Distributed tracing
- [Prometheus Setup](docs/06-observability/05-prometheus-setup.md) - Prometheus configuration
- [Grafana Dashboards](docs/06-observability/06-grafana-dashboards.md) - Dashboard creation
- [Alerting](docs/06-observability/07-alerting.md) - Alert configuration
- [SLOs & Error Budgets](docs/06-observability/08-slos-and-error-budgets.md) - SLO definition

### Chaos Engineering
- [Chaos Overview](docs/07-chaos-engineering/01-chaos-overview.md) - Chaos engineering introduction
- [Chaos Configuration](docs/07-chaos-engineering/02-chaos-configuration.md) - Configuration guide
- [Latency Injection](docs/07-chaos-engineering/03-latency-injection.md) - Latency injection
- [Failure Simulation](docs/07-chaos-engineering/04-failure-simulation.md) - Failure injection
- [Chaos Metrics](docs/07-chaos-engineering/05-chaos-metrics.md) - Chaos metrics
- [Chaos Scenarios](docs/07-chaos-engineering/06-chaos-scenarios.md) - Scenario examples

### Testing
- [Testing Overview](docs/08-testing/01-testing-overview.md) - Testing strategy
- [Test Strategy](docs/08-testing/02-test-strategy.md) - Test approach
- [E2E Tests](docs/08-testing/03-e2e-tests.md) - E2E test suite
- [Test Execution](docs/08-testing/04-test-execution.md) - Running tests
- [Test Coverage](docs/08-testing/05-test-coverage.md) - Coverage metrics
- [Release Gates](docs/08-testing/06-release-gates.md) - Release validation

### SRE Training
- [Training Overview](docs/09-sre-training/01-training-overview.md) - Training curriculum
- [Day 1: Setup](docs/09-sre-training/02-day-1-setup.md) - Day 1 curriculum
- [Day 2: Observability](docs/09-sre-training/03-day-2-observability.md) - Day 2 curriculum
- [Day 3: Chaos Engineering](docs/09-sre-training/04-day-3-chaos-engineering.md) - Day 3 curriculum
- [Day 4: Incident Response](docs/09-sre-training/05-day-4-incident-response.md) - Day 4 curriculum
- [Day 5: Production Readiness](docs/09-sre-training/06-day-5-production-readiness.md) - Day 5 curriculum
- [Incident Simulation Labs](docs/09-sre-training/07-incident-simulation-labs.md) - Incident labs
- [RCA Labs](docs/09-sre-training/08-rca-labs.md) - Root cause analysis labs
- [Training Scenarios](docs/09-sre-training/09-training-scenarios.md) - Additional scenarios

### Troubleshooting
- [Troubleshooting Overview](docs/10-troubleshooting/01-troubleshooting-overview.md) - Troubleshooting guide
- [Common Issues](docs/10-troubleshooting/02-common-issues.md) - Common problems
- [Deployment Issues](docs/10-troubleshooting/03-deployment-issues.md) - Deployment troubleshooting
- [Database Issues](docs/10-troubleshooting/04-database-issues.md) - Database troubleshooting
- [Redis Issues](docs/10-troubleshooting/05-redis-issues.md) - Redis troubleshooting
- [Worker Issues](docs/10-troubleshooting/06-worker-issues.md) - Worker troubleshooting
- [Observability Issues](docs/10-troubleshooting/07-observability-issues.md) - Observability troubleshooting

### Reference
- [Glossary](docs/11-reference/01-glossary.md) - Term definitions
- [Acronyms](docs/11-reference/02-acronyms.md) - Acronym reference
- [File Structure](docs/11-reference/03-file-structure.md) - Project structure
- [Code Organization](docs/11-reference/04-code-organization.md) - Code organization

### Security
- [Security Overview](docs/12-security/01-security-overview.md) - Security model
- [Authentication Model](docs/12-security/02-authentication-model.md) - Authentication details
- [Authorization & RBAC](docs/12-security/03-authorization-rbac.md) - Role-based access
- [RLS Policies](docs/12-security/04-rls-policies.md) - Row Level Security
- [Secrets Management](docs/12-security/05-secrets-management.md) - Secrets handling
- [Network Security](docs/12-security/06-network-security.md) - Network-level security

## Technology Stack

### Frontend
- React 18.3
- TypeScript 5.5
- Vite 5.4
- Tailwind CSS 3.4

### Backend
- Express.js 4.18
- Node.js 20+
- TypeScript 5.5
- Winston 3.11 (logging)
- prom-client 15.1 (metrics)
- OpenTelemetry 0.51.0 (tracing)

### Database
- Supabase (managed PostgreSQL)
- PostgreSQL adapter (optional)
- OCI Autonomous adapter (optional)

### Cache & Queue
- Redis (via ioredis 5.8)
- Bull 4.16 (job queue)
- Memory cache (default)

### Testing
- Jest 29.7.0
- Supertest 6.3.3

**Source:** Technology stack from `package.json` and implementation files.

## Project Structure

```
├── server/          # Backend Express.js application
├── src/            # Frontend React application
├── tests/          # E2E test suite
├── deployment/     # Deployment configurations
├── supabase/       # Database migrations
├── docs/           # Complete documentation
└── scripts/        # Utility scripts
```

**Source:** Project structure in `docs/11-reference/03-file-structure.md`.

## Key Features

### Multi-Tier Architecture
- 6-layer architecture (Frontend, API, Database, Cache, Workers, Observability)
- Configurable adapters for infrastructure flexibility
- Support for multiple deployment modes

**Source:** Architecture in `docs/02-architecture/01-system-architecture.md`.

### Observability
- Prometheus metrics (`/metrics` endpoint)
- Structured JSON logging (Winston)
- OpenTelemetry distributed tracing
- SLOs and error budgets

**Source:** Observability in `docs/06-observability/01-observability-overview.md`.

### Chaos Engineering
- Latency injection (configurable)
- Payment failure simulation (10% rate in training mode)
- Chaos event tracking
- Metrics integration

**Source:** Chaos engineering in `docs/07-chaos-engineering/01-chaos-overview.md`.

### Testing
- Comprehensive E2E test suite (9 test files)
- SRE release gate validation
- Test coverage for all critical paths

**Source:** Testing in `docs/08-testing/01-testing-overview.md`.

## Development

### Available Scripts

```bash
# Development
npm run dev -- --host 0.0.0.0 --port 5173               # Start frontend dev server
npm run dev:server                                      # Start backend dev server
npm run dev:worker                                      # Start worker dev server

# Building
npm run build            # Build both frontend and backend
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Testing
npm test                 # Run all tests
npm run test:e2e         # Run E2E tests only
npm run test:sre         # Run SRE validation

# Database
npm run db:init          # Initialize database
npm run db:reset         # Reset database
```

**Source:** Scripts in `package.json` lines 7-28.

## Deployment

### Deployment Modes

1. **Single-VM** - All components on one VM
2. **Multi-Tier** - Separate VMs per tier
3. **Kubernetes** - Container orchestration
4. **Docker Compose** - Local multi-tier development

**Source:** Deployment modes in `docs/05-deployment/01-deployment-overview.md`.

## SRE Training

### 5-Day Curriculum

- **Day 1:** Setup & Fundamentals
- **Day 2:** Observability
- **Day 3:** Chaos Engineering
- **Day 4:** Incident Response
- **Day 5:** Production Readiness

**Source:** Training curriculum in `docs/09-sre-training/01-training-overview.md`.

## Contributing

This is an SRE training platform. For training purposes, follow the documentation and complete the labs as outlined in the SRE Training section.

## License

[Specify license if applicable]

## Support

For issues and questions:
1. Check the [Troubleshooting Guide](docs/10-troubleshooting/01-troubleshooting-overview.md)
2. Review the [Documentation](docs/)
3. Check E2E tests for expected behavior

---

**Note:** This platform is designed for SRE training. Review security and production readiness before any production deployment.

