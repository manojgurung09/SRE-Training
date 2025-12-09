# Deployment Overview

Complete deployment guide covering all deployment modes and strategies.

## Deployment Modes

The platform supports three deployment modes:

1. **Single-VM Mode** - All components on one virtual machine
2. **Multi-Tier Mode** - Separate VMs per tier
3. **Kubernetes Mode** - Container orchestration

**Source:** Deployment modes in `server/config/deployment.ts` lines 5, 22.

## Deployment Options

### Local Development

**Method:** Docker Compose

**File:** `deployment/docker-compose.yml`

**Services:**
- Frontend (React SPA)
- Backend API (Express.js)
- Cache (Redis)
- Queue (Redis)
- Workers (email, orders)
- Prometheus
- Grafana

**Source:** Docker Compose configuration in `deployment/docker-compose.yml`.

### Single-VM Deployment

**Method:** Direct installation on VM

**Components:**
- All services on one VM
- Simple setup
- Suitable for development/small deployments

**Source:** Single-VM mode in `server/config/deployment.ts` line 22.

### Multi-Tier Deployment

**Method:** Separate VMs per tier

**Tiers:**
- Tier 1: Frontend
- Tier 2: Backend API
- Tier 3: Database
- Tier 4: Cache
- Tier 5: Workers
- Tier 6: Observability

**Source:** Multi-tier architecture in `docs/02-architecture/01-system-architecture.md`.

### Kubernetes Deployment

**Method:** Kubernetes orchestration

**Manifests:** `deployment/kubernetes/`

**Resources:**
- Deployments (backend, frontend, workers)
- Services
- ConfigMaps
- Secrets
- Ingress
- HorizontalPodAutoscaler

**Source:** Kubernetes manifests in `deployment/kubernetes/` directory.

### Docker Deployment

**Method:** Docker containers

**Dockerfiles:**
- `deployment/Dockerfile.backend` - Backend API
- `deployment/Dockerfile.frontend` - Frontend SPA
- `deployment/Dockerfile.workers` - Background workers

**Source:** Dockerfiles in `deployment/` directory.

### OCI Deployment

**Method:** Oracle Cloud Infrastructure

**Components:**
- OCI Compute VMs
- OCI Autonomous Database
- OCI Cache
- OCI Vault (secrets)

**Source:** OCI adapter implementations in `server/adapters/`.

## Prerequisites

### Required

- Node.js 20+
- npm or yarn
- Git
- Supabase account (for database)

### Optional (Based on Deployment Mode)

- Docker & Docker Compose (for local development)
- Kubernetes cluster (for Kubernetes deployment)
- OCI account (for OCI deployment)
- Redis (for cache/queue)

**Source:** Prerequisites based on deployment requirements.

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Secrets configured
- [ ] Health checks configured
- [ ] Monitoring configured

### Deployment

- [ ] Build application
- [ ] Deploy infrastructure
- [ ] Deploy application
- [ ] Verify health endpoints
- [ ] Verify metrics endpoint

### Post-Deployment

- [ ] Run E2E tests
- [ ] Verify observability
- [ ] Configure alerts
- [ ] Document deployment

**Source:** Deployment checklist based on best practices.

## Environment Configuration

### Required Variables

**Database:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Source:** Required environment variables in `server/config/supabase.ts` and `src/lib/supabase.ts`.

### Optional Variables

**Server:**
- `PORT` (default: 3000)
- `FRONTEND_URL` (default: http://localhost:5173)
- `NODE_ENV` (default: development)

**Cache:**
- `CACHE_TYPE` (default: memory)
- `CACHE_REDIS_URL` (if using Redis)

**Workers:**
- `WORKER_MODE` (default: in-process)
- `QUEUE_REDIS_URL` (if using Bull Queue)

**Source:** Optional environment variables in `server/config/deployment.ts`.

## Health Checks

### Liveness Probe

**Endpoint:** `GET /api/health`

**Purpose:** Check if service is running

**Response:** `{ ok: true }`

**Source:** Health endpoint in `server/routes/health.ts` line 5.

### Readiness Probe

**Endpoint:** `GET /api/health/ready`

**Purpose:** Check if service is ready to serve traffic

**Response:** `{ status: 'ready' }` (after database check)

**Source:** Readiness endpoint in `server/routes/health.ts` line 12.

## Monitoring

### Metrics Endpoint

**Endpoint:** `GET /metrics`

**Format:** Prometheus text format

**Source:** Metrics endpoint in `server/app.ts` lines 39-42.

### Prometheus Configuration

**File:** `deployment/prometheus.yml`

**Scrape Jobs:**
- Backend API
- Redis cache
- Redis queue
- Workers

**Source:** Prometheus configuration in `deployment/prometheus.yml`.

## Training vs Production

### Training Mode

**Deployment:** Single-VM or Docker Compose

**Use Case:** Learning, development, SRE training

### Production Mode

**Deployment:** Multi-tier or Kubernetes

**Use Case:** Production deployments, scalability, high availability

**Source:** Deployment mode selection based on requirements.

## Next Steps

- [Local Development](02-local-development.md) - Local setup guide
- [Single-VM Deployment](03-single-vm-deployment.md) - Single-VM deployment
- [Multi-Tier Deployment](04-multi-tier-deployment.md) - Multi-tier deployment
- [Kubernetes Deployment](05-kubernetes-deployment.md) - Kubernetes deployment
- [Docker Deployment](06-docker-deployment.md) - Docker deployment
- [OCI Deployment](07-oci-deployment.md) - OCI deployment
- [Scaling Guide](08-scaling-guide.md) - Scaling strategies

