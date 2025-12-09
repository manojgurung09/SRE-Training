# Deployment Modes

Deployment mode configurations: single-VM, multi-tier, and Kubernetes.

## Overview

**Configuration File:** `server/config/deployment.ts`

**Environment Variable:** `DEPLOYMENT_MODE`

**Options:**
- `single-vm` - All components on one VM
- `multi-tier` - Separate VMs per tier
- `kubernetes` - Kubernetes orchestration

**Source:** Deployment mode configuration in `server/config/deployment.ts` lines 5, 22.

## Single-VM Mode

### Configuration

```bash
DEPLOYMENT_MODE=single-vm
```

**Default:** Yes

**Source:** Default deployment mode in `server/config/deployment.ts` line 22.

### Architecture

**All components on one virtual machine:**
- Frontend (React SPA)
- Backend API (Express.js)
- Database (Supabase/PostgreSQL)
- Cache (Memory/Redis)
- Workers (In-process/Bull Queue)
- Observability (Prometheus, logs)

**Source:** Single-VM mode characteristics.

### Use Cases

- Development
- Small deployments
- Learning/training
- Proof of concept

**Source:** Single-VM mode use cases.

## Multi-Tier Mode

### Configuration

```bash
DEPLOYMENT_MODE=multi-tier
```

**Source:** Multi-tier mode configuration.

### Architecture

**Separate VMs per tier:**
- **Tier 1:** Frontend (React SPA)
- **Tier 2:** Backend API (Express.js)
- **Tier 3:** Database (Supabase/PostgreSQL/OCI Autonomous)
- **Tier 4:** Cache (Redis)
- **Tier 5:** Workers (Bull Queue)
- **Tier 6:** Observability (Prometheus, Grafana)

**Source:** Multi-tier architecture in `docs/02-architecture/01-system-architecture.md`.

### Use Cases

- Production deployments
- Scalability requirements
- High availability
- Enterprise deployments

**Source:** Multi-tier mode use cases.

## Kubernetes Mode

### Configuration

```bash
DEPLOYMENT_MODE=kubernetes
```

**Source:** Kubernetes mode configuration.

### Architecture

**Kubernetes orchestration:**
- Frontend deployment
- Backend deployment (with HPA)
- Database (external or StatefulSet)
- Redis (StatefulSet or external)
- Workers (Deployment)
- Prometheus (Deployment)
- Grafana (Deployment)

**Source:** Kubernetes manifests in `deployment/kubernetes/` directory.

### Kubernetes Resources

**Deployments:**
- `backend-deployment.yaml` - Backend API
- `frontend-deployment.yaml` - Frontend SPA
- `worker-deployment.yaml` - Background workers

**Services:**
- `backend-service.yaml` - Backend service
- `frontend-service.yaml` - Frontend service

**ConfigMaps:**
- `bharatmart-config` - Configuration

**Secrets:**
- `bharatmart-secrets` - Secrets

**Source:** Kubernetes resource files in `deployment/kubernetes/` directory.

### Horizontal Pod Autoscaling (HPA)

**Backend HPA:**
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

**Source:** HPA configuration in `deployment/kubernetes/backend-deployment.yaml` lines 113-155.

## Deployment Configuration

### Helper Functions

**File:** `server/config/deployment.ts`

**Functions:**
- `isSingleVM()` - Check if single-VM mode
- `isMultiTier()` - Check if multi-tier mode
- `isKubernetes()` - Check if Kubernetes mode
- `shouldUseWorkers()` - Check if workers should be used
- `shouldUseExternalCache()` - Check if external cache should be used

**Source:** Helper functions in `server/config/deployment.ts` lines 30-48.

## Infrastructure Selection

### Database Selection

**Options:**
- `supabase` - Supabase (managed)
- `postgresql` - PostgreSQL (self-hosted)
- `oci-autonomous` - OCI Autonomous Database

**Configuration:** `DATABASE_TYPE` environment variable

**Source:** Database type in `server/config/deployment.ts` line 25.

### Cache Selection

**Options:**
- `memory` - In-process memory
- `redis` - Redis
- `oci-cache` - OCI Cache

**Configuration:** `CACHE_TYPE` environment variable

**Source:** Cache type in `server/config/deployment.ts` line 27.

### Worker Selection

**Options:**
- `in-process` - Synchronous processing
- `bull-queue` - Bull Queue with Redis
- `none` - No workers

**Configuration:** `WORKER_MODE` environment variable

**Source:** Worker mode in `server/config/deployment.ts` line 26.

## Docker Compose

### Local Multi-Tier

**File:** `deployment/docker-compose.yml`

**Services:**
- Frontend
- Backend
- Cache (Redis)
- Queue (Redis)
- Workers (email, orders)
- Prometheus
- Grafana

**Source:** Docker Compose configuration in `deployment/docker-compose.yml`.

## Training vs Production

### Training Mode

**Default:** Single-VM mode

**Use Case:** Learning, development, SRE training

### Production Mode

**Recommended:** Multi-tier or Kubernetes mode

**Use Case:** Production deployments, scalability, high availability

**Source:** Deployment mode selection based on requirements.

## Next Steps

- [System Architecture](01-system-architecture.md) - Overall system architecture
- [Deployment Guides](../05-deployment/) - Detailed deployment instructions
- [Configuration: Deployment](../04-configuration/06-deployment-configuration.md) - Deployment configuration

