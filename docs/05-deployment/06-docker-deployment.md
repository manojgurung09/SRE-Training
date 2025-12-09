# Docker Deployment

Complete Docker deployment guide with Dockerfiles and containerization.

## Dockerfiles

### Backend Dockerfile

**File:** `deployment/Dockerfile.backend`

**Base Image:** `node:18-alpine`

**Build Process:**
1. Copy package files
2. Install production dependencies
3. Copy backend source code
4. Build TypeScript
5. Expose ports 3000 and 9090
6. Configure health check

**Source:** Backend Dockerfile in `deployment/Dockerfile.backend`.

### Frontend Dockerfile

**File:** `deployment/Dockerfile.frontend`

**Build Strategy:** Multi-stage build

**Stage 1 - Builder:**
- Base: `node:18-alpine`
- Install dependencies
- Build application with Vite

**Stage 2 - Production:**
- Base: `nginx:alpine`
- Copy built assets
- Configure nginx

**Source:** Frontend Dockerfile in `deployment/Dockerfile.frontend`.

### Workers Dockerfile

**File:** `deployment/Dockerfile.workers`

**Base Image:** `node:18-alpine`

**Build Process:**
1. Copy package files
2. Install production dependencies
3. Copy worker source code
4. Build TypeScript
5. Configure health check

**Source:** Workers Dockerfile in `deployment/Dockerfile.workers`.

## Building Images

### Build Backend Image

```bash
docker build -f deployment/Dockerfile.backend -t bharatmart-backend:latest .
```

**Source:** Docker build command for backend.

### Build Frontend Image

```bash
docker build -f deployment/Dockerfile.frontend \
  --build-arg VITE_API_GATEWAY_URL=http://localhost:3000 \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t bharatmart-frontend:latest .
```

**Source:** Frontend Dockerfile build arguments in `deployment/Dockerfile.frontend` lines 19-25.

### Build Workers Image

```bash
docker build -f deployment/Dockerfile.workers -t bharatmart-workers:latest .
```

**Source:** Docker build command for workers.

## Docker Compose

### Configuration

**File:** `deployment/docker-compose.yml`

**Services:**
- `frontend` - React SPA (port 80)
- `backend` - Express API (port 3000)
- `cache` - Redis cache (port 6379)
- `queue` - Redis queue (port 6380)
- `worker-email` - Email worker
- `worker-orders` - Order worker
- `prometheus` - Prometheus (port 9091)
- `grafana` - Grafana (port 3001)

**Source:** Docker Compose configuration in `deployment/docker-compose.yml`.

### Start Services

```bash
cd deployment
docker-compose up -d
```

**Source:** Docker Compose commands.

### Stop Services

```bash
docker-compose down
```

**Source:** Docker Compose commands.

### View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f worker-email
```

**Source:** Docker Compose log commands.

## Environment Variables

### Backend Environment

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional:**
- `PORT` (default: 3000)
- `FRONTEND_URL`
- `CACHE_REDIS_URL`
- `QUEUE_REDIS_URL`

**Source:** Backend environment variables in `deployment/docker-compose.yml` lines 31-38.

### Frontend Environment

**Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Optional:**
- `VITE_API_GATEWAY_URL`

**Source:** Frontend environment variables in `deployment/docker-compose.yml` lines 14-17.

### Workers Environment

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `QUEUE_REDIS_URL`

**Optional:**
- `WORKER_TYPE` (default: all)
- `WORKER_CONCURRENCY` (default: 5)

**Source:** Workers environment variables in `deployment/docker-compose.yml` lines 74-80, 92-98.

## Health Checks

### Backend Health Check

**Configuration:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1
```

**Endpoint:** `GET /api/health`

**Source:** Backend health check in `deployment/Dockerfile.backend` lines 24-25.

### Frontend Health Check

**Configuration:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health.html || exit 1
```

**Source:** Frontend health check in `deployment/Dockerfile.frontend` lines 43-44.

### Workers Health Check

**Configuration:**
```dockerfile
HEALTHCHECK --interval=60s --timeout=3s --start-period=30s --retries=3 \
  CMD pgrep -f "node" || exit 1
```

**Source:** Workers health check in `deployment/Dockerfile.workers` lines 24-25.

## Volumes

### Persistent Volumes

**Cache Data:**
- `cache-data` - Redis cache persistence

**Queue Data:**
- `queue-data` - Redis queue persistence

**Prometheus Data:**
- `prometheus-data` - Prometheus metrics storage

**Grafana Data:**
- `grafana-data` - Grafana dashboards and settings

**Source:** Volume definitions in `deployment/docker-compose.yml` lines 138-142.

## Networking

### Network Configuration

**Network:** `app-network`

**Driver:** `bridge`

**Source:** Network configuration in `deployment/docker-compose.yml` lines 134-136.

### Service Dependencies

**Backend depends on:**
- `cache`
- `queue`

**Workers depend on:**
- `queue`

**Frontend depends on:**
- `backend`

**Source:** Service dependencies in `deployment/docker-compose.yml`.

## Production Considerations

### Image Optimization

**Recommendations:**
- Use multi-stage builds
- Minimize image size
- Use Alpine Linux base images
- Remove dev dependencies

**Source:** Dockerfile optimization best practices.

### Security

**Recommendations:**
- Use non-root user
- Scan images for vulnerabilities
- Keep base images updated
- Use secrets management

**Source:** Docker security best practices.

### Resource Limits

**Example:**
```yaml
resources:
  limits:
    memory: 512Mi
    cpu: 500m
  requests:
    memory: 256Mi
    cpu: 250m
```

**Source:** Resource limits example from Kubernetes manifests.

## Troubleshooting

### Container Won't Start

**Check:**
- Environment variables
- Port conflicts
- Volume permissions
- Health check failures

**Source:** Common Docker issues.

### Logs Not Appearing

**Check:**
- Log file permissions
- Log level configuration
- Container logs: `docker-compose logs`

**Source:** Logging troubleshooting.

## Next Steps

- [Deployment Overview](01-deployment-overview.md) - Deployment options
- [Kubernetes Deployment](05-kubernetes-deployment.md) - Kubernetes setup
- [Scaling Guide](08-scaling-guide.md) - Scaling strategies

