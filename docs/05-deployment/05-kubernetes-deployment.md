# Kubernetes Deployment

Complete Kubernetes deployment guide with manifests and configuration.

## Overview

**Manifests Location:** `deployment/kubernetes/`

**Namespace:** `bharatmart`

**Components:**
- Backend API deployment
- Frontend deployment
- Worker deployments
- Redis cache
- Redis queue
- ConfigMaps
- Secrets
- Ingress
- HorizontalPodAutoscaler

**Source:** Kubernetes manifests in `deployment/kubernetes/` directory.

## Prerequisites

### Required

- Kubernetes cluster (1.20+)
- kubectl configured
- Container registry access
- Persistent volumes configured

**Source:** Kubernetes deployment requirements.

## Namespace Setup

### Create Namespace

**File:** `deployment/kubernetes/namespace.yaml`

```bash
kubectl apply -f deployment/kubernetes/namespace.yaml
```

**Source:** Namespace manifest in `deployment/kubernetes/namespace.yaml`.

## Configuration

### ConfigMap

**File:** `deployment/kubernetes/configmap.yaml`

**Configuration:**
- Frontend URL
- Cache Redis URL
- Queue Redis URL
- Metrics port
- Log level
- Worker concurrency

**Apply:**
```bash
kubectl apply -f deployment/kubernetes/configmap.yaml
```

**Source:** ConfigMap in `deployment/kubernetes/configmap.yaml`.

### Secrets

**File:** `deployment/kubernetes/secrets.yaml.example`

**Required Secrets:**
- `supabase_url`
- `supabase_service_role_key`
- `smtp_host` (optional)
- `smtp_user` (optional)
- `smtp_password` (optional)

**Create Secrets:**
```bash
kubectl create secret generic bharatmart-secrets \
  --from-literal=supabase_url=https://your-project.supabase.co \
  --from-literal=supabase_service_role_key=your-key \
  -n bharatmart
```

**Source:** Secrets example in `deployment/kubernetes/secrets.yaml.example`.

## Backend Deployment

### Deployment

**File:** `deployment/kubernetes/backend-deployment.yaml`

**Configuration:**
- Replicas: 3
- Ports: 3000 (HTTP), 9090 (metrics)
- Health checks: Liveness and readiness probes
- Resources: 256Mi-512Mi memory, 250m-500m CPU
- HorizontalPodAutoscaler: 2-10 replicas

**Apply:**
```bash
kubectl apply -f deployment/kubernetes/backend-deployment.yaml
```

**Source:** Backend deployment in `deployment/kubernetes/backend-deployment.yaml`.

### Service

**Type:** ClusterIP

**Ports:**
- 3000 (HTTP)
- 9090 (metrics)

**Source:** Backend service in `deployment/kubernetes/backend-deployment.yaml` lines 89-111.

### HorizontalPodAutoscaler

**Configuration:**
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

**Source:** HPA in `deployment/kubernetes/backend-deployment.yaml` lines 113-155.

## Worker Deployments

### Email Worker

**File:** `deployment/kubernetes/workers-deployment.yaml`

**Configuration:**
- Replicas: 2
- Worker type: email
- Concurrency: 3
- Resources: 128Mi-256Mi memory, 100m-200m CPU

**Source:** Email worker in `deployment/kubernetes/workers-deployment.yaml` lines 1-71.

### Order Worker

**Configuration:**
- Replicas: 3
- Worker type: order
- Concurrency: 5
- Resources: 128Mi-256Mi memory, 100m-200m CPU
- HPA: 2-20 replicas

**Source:** Order worker in `deployment/kubernetes/workers-deployment.yaml` lines 73-128, 187-226.

### Payment Worker

**Configuration:**
- Replicas: 2
- Worker type: payment
- Concurrency: 3
- Resources: 128Mi-256Mi memory, 100m-200m CPU

**Source:** Payment worker in `deployment/kubernetes/workers-deployment.yaml` lines 130-185.

## Redis Deployments

### Redis Cache

**File:** `deployment/kubernetes/redis-cache.yaml`

**Configuration:**
- Replicas: 1
- Image: redis:7-alpine
- Max memory: 512mb
- Eviction policy: allkeys-lru
- Persistent volume: 5Gi

**Apply:**
```bash
kubectl apply -f deployment/kubernetes/redis-cache.yaml
```

**Source:** Redis cache in `deployment/kubernetes/redis-cache.yaml`.

### Redis Queue

**File:** `deployment/kubernetes/redis-queue.yaml`

**Configuration:**
- Replicas: 1
- Image: redis:7-alpine
- AOF enabled: yes
- Persistent volume: 10Gi

**Apply:**
```bash
kubectl apply -f deployment/kubernetes/redis-queue.yaml
```

**Source:** Redis queue in `deployment/kubernetes/redis-queue.yaml`.

## Ingress

### Ingress Configuration

**File:** `deployment/kubernetes/ingress.yaml`

**Configuration:**
- TLS enabled
- Rate limiting: 100 requests
- CORS enabled
- SSL redirect enabled

**Apply:**
```bash
kubectl apply -f deployment/kubernetes/ingress.yaml
```

**Source:** Ingress in `deployment/kubernetes/ingress.yaml`.

## Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f deployment/kubernetes/namespace.yaml
```

### 2. Create Secrets

```bash
kubectl create secret generic bharatmart-secrets \
  --from-literal=supabase_url=... \
  --from-literal=supabase_service_role_key=... \
  -n bharatmart
```

### 3. Create ConfigMap

```bash
kubectl apply -f deployment/kubernetes/configmap.yaml
```

### 4. Deploy Redis

```bash
kubectl apply -f deployment/kubernetes/redis-cache.yaml
kubectl apply -f deployment/kubernetes/redis-queue.yaml
```

### 5. Deploy Backend

```bash
kubectl apply -f deployment/kubernetes/backend-deployment.yaml
```

### 6. Deploy Workers

```bash
kubectl apply -f deployment/kubernetes/workers-deployment.yaml
```

### 7. Deploy Ingress

```bash
kubectl apply -f deployment/kubernetes/ingress.yaml
```

## Verification

### Check Pods

```bash
kubectl get pods -n bharatmart
```

### Check Services

```bash
kubectl get services -n bharatmart
```

### Check Deployments

```bash
kubectl get deployments -n bharatmart
```

### Check HPA

```bash
kubectl get hpa -n bharatmart
```

## Health Checks

### Liveness Probe

**Backend:**
- Endpoint: `/api/health`
- Interval: 30s
- Timeout: 5s
- Failure threshold: 3

**Source:** Liveness probe in `deployment/kubernetes/backend-deployment.yaml` lines 72-79.

### Readiness Probe

**Backend:**
- Endpoint: `/api/health/ready`
- Interval: 5s
- Timeout: 3s
- Failure threshold: 2

**Source:** Readiness probe in `deployment/kubernetes/backend-deployment.yaml` lines 80-87.

## Scaling

### Manual Scaling

```bash
kubectl scale deployment bharatmart-backend --replicas=5 -n bharatmart
```

### Automatic Scaling

**HPA Configuration:**
- CPU threshold: 70%
- Memory threshold: 80%
- Min replicas: 2
- Max replicas: 10

**Source:** HPA in `deployment/kubernetes/backend-deployment.yaml` lines 113-155.

## Monitoring

### Prometheus Scraping

**Configuration:** `deployment/prometheus.yml`

**Scrape Jobs:**
- Backend API
- Redis cache
- Redis queue
- Workers

**Source:** Prometheus configuration in `deployment/prometheus.yml`.

## Troubleshooting

### Pod Logs

```bash
kubectl logs -f deployment/bharatmart-backend -n bharatmart
```

### Pod Status

```bash
kubectl describe pod <pod-name> -n bharatmart
```

### Events

```bash
kubectl get events -n bharatmart --sort-by='.lastTimestamp'
```

## Next Steps

- [Deployment Overview](01-deployment-overview.md) - Deployment options
- [Scaling Guide](08-scaling-guide.md) - Scaling strategies
- [Docker Deployment](06-docker-deployment.md) - Docker setup

