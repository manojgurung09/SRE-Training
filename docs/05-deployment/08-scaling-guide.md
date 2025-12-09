# Scaling Guide

Complete guide to scaling the BharatMart platform horizontally and vertically.

## Scaling Overview

**Scaling Types:**
- Horizontal scaling (add more instances)
- Vertical scaling (increase resources)
- Auto-scaling (automatic scaling)

**Source:** Scaling strategies based on deployment modes.

## Horizontal Scaling

### Backend API Scaling

**Kubernetes:**
- Use HorizontalPodAutoscaler (HPA)
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

**Configuration:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Source:** HPA in `deployment/kubernetes/backend-deployment.yaml` lines 113-155.

**Multi-Tier:**
- Add more backend VMs
- Use load balancer
- Configure session affinity if needed

**Source:** Multi-tier scaling strategy.

### Worker Scaling

**Order Workers:**
- HPA: 2-20 replicas
- CPU target: 75%
- Memory target: 80%
- Scale based on queue depth

**Configuration:**
```yaml
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
```

**Source:** Worker HPA in `deployment/kubernetes/workers-deployment.yaml` lines 187-226.

**Email Workers:**
- Fixed replicas: 2
- Scale manually if needed

**Payment Workers:**
- Fixed replicas: 2
- Scale manually if needed

**Source:** Worker deployments in `deployment/kubernetes/workers-deployment.yaml`.

## Vertical Scaling

### Resource Limits

**Backend API:**
- Requests: 256Mi memory, 250m CPU
- Limits: 512Mi memory, 500m CPU

**Workers:**
- Requests: 128Mi memory, 100m CPU
- Limits: 256Mi memory, 200m CPU

**Source:** Resource limits in Kubernetes manifests.

### Increasing Resources

**Kubernetes:**
```bash
kubectl set resources deployment bharatmart-backend \
  --requests=memory=512Mi,cpu=500m \
  --limits=memory=1Gi,cpu=1000m \
  -n bharatmart
```

**Source:** Kubernetes resource update command.

## Auto-Scaling

### Kubernetes HPA

**Backend HPA:**
- Scale up: 100% increase, 30s period
- Scale down: 50% decrease, 60s period
- Stabilization: 0s (up), 300s (down)

**Source:** HPA behavior in `deployment/kubernetes/backend-deployment.yaml` lines 138-154.

**Worker HPA:**
- Scale up: 2 pods, 30s period
- Scale down: 1 pod, 60s period
- Stabilization: 60s (up), 300s (down)

**Source:** Worker HPA behavior in `deployment/kubernetes/workers-deployment.yaml` lines 213-225.

### Scaling Metrics

**CPU Utilization:**
- Target: 70-80%
- Triggers scaling when exceeded

**Memory Utilization:**
- Target: 80%
- Triggers scaling when exceeded

**Queue Depth (Workers):**
- Monitor queue depth
- Scale workers based on backlog

**Source:** Scaling metrics in HPA configurations.

## Database Scaling

### Supabase Scaling

**Options:**
- Upgrade Supabase plan
- Use read replicas (Pro tier)
- Optimize queries
- Use connection pooling

**Source:** Supabase scaling options.

### PostgreSQL Scaling

**Options:**
- Read replicas
- Connection pooling (PgBouncer)
- Query optimization
- Partitioning

**Source:** PostgreSQL scaling strategies.

## Cache Scaling

### Redis Scaling

**Options:**
- Redis Cluster (horizontal)
- Redis Sentinel (high availability)
- Increase memory limits
- Optimize eviction policies

**Configuration:**
- Max memory: 512mb (cache)
- Eviction policy: allkeys-lru

**Source:** Redis configuration in `deployment/kubernetes/redis-cache.yaml`.

## Load Balancing

### Kubernetes

**Service Type:** ClusterIP (internal) or LoadBalancer (external)

**Ingress:**
- Nginx Ingress Controller
- Rate limiting: 100 requests
- SSL termination

**Source:** Ingress configuration in `deployment/kubernetes/ingress.yaml`.

### Multi-Tier

**Load Balancer:**
- OCI Load Balancer
- AWS ELB/ALB
- Azure Load Balancer

**Configuration:**
- Health checks
- Session affinity (if needed)
- SSL termination

**Source:** Multi-tier load balancing.

## Monitoring Scaling

### Metrics to Monitor

**Backend:**
- Request rate
- Response latency
- Error rate
- CPU/Memory usage

**Workers:**
- Queue depth
- Job processing rate
- Worker CPU/Memory
- Failed jobs

**Source:** Monitoring metrics in `server/config/metrics.ts`.

### Scaling Triggers

**Scale Up:**
- CPU > 70% for 5 minutes
- Memory > 80% for 5 minutes
- Queue depth > threshold

**Scale Down:**
- CPU < 50% for 15 minutes
- Memory < 60% for 15 minutes
- Queue depth < threshold

**Source:** Scaling trigger logic.

## Best Practices

### Scaling Strategy

1. **Start Small:** Begin with minimum replicas
2. **Monitor Metrics:** Watch CPU, memory, queue depth
3. **Set Appropriate Targets:** 70-80% utilization
4. **Test Scaling:** Verify scaling behavior
5. **Set Limits:** Prevent over-scaling

**Source:** Scaling best practices.

### Resource Planning

1. **Estimate Load:** Calculate expected traffic
2. **Plan Capacity:** Reserve 20-30% headroom
3. **Monitor Growth:** Track usage trends
4. **Adjust Limits:** Update as needed

**Source:** Resource planning best practices.

## Training vs Production

### Training Mode

**Scaling:** Manual or minimal auto-scaling

**Use Case:** Learning scaling concepts

### Production Mode

**Scaling:** Full auto-scaling enabled

**Use Case:** Handle production load

**Source:** Scaling mode differences.

## Next Steps

- [Deployment Overview](01-deployment-overview.md) - Deployment options
- [Kubernetes Deployment](05-kubernetes-deployment.md) - Kubernetes setup
- [Multi-Tier Deployment](04-multi-tier-deployment.md) - Multi-tier setup

