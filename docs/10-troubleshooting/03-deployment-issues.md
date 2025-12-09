# Deployment Issues

Troubleshooting guide for deployment-related problems.

## Docker Issues

### Container Won't Start

**Symptom:** Docker container exits immediately

**Solutions:**
1. **Check Logs:**
   ```bash
   docker-compose logs backend
   ```

2. **Check Environment Variables:**
   - Verify `.env` file exists
   - Check required variables are set
   - Review environment configuration

3. **Check Health Checks:**
   - Review health check configuration
   - Verify health endpoints work
   - Adjust health check timing

**Source:** Docker configuration in `deployment/docker-compose.yml`.

### Image Build Fails

**Symptom:** Docker build errors

**Solutions:**
1. **Check Dockerfile:**
   - Verify Dockerfile syntax
   - Check base image availability
   - Review build steps

2. **Check Dependencies:**
   - Verify package.json
   - Check for missing dependencies
   - Review build context

**Source:** Dockerfiles in `deployment/` directory.

## Kubernetes Issues

### Pods Not Starting

**Symptom:** Pods in CrashLoopBackOff or Pending

**Solutions:**
1. **Check Pod Logs:**
   ```bash
   kubectl logs -n bharatmart <pod-name>
   ```

2. **Check Pod Status:**
   ```bash
   kubectl describe pod -n bharatmart <pod-name>
   ```

3. **Check Resources:**
   - Verify resource requests/limits
   - Check node resources
   - Review resource quotas

**Source:** Kubernetes manifests in `deployment/kubernetes/`.

### Service Not Accessible

**Symptom:** Cannot access service

**Solutions:**
1. **Check Service:**
   ```bash
   kubectl get svc -n bharatmart
   ```

2. **Check Endpoints:**
   ```bash
   kubectl get endpoints -n bharatmart
   ```

3. **Check Ingress:**
   - Verify ingress configuration
   - Check ingress controller
   - Review TLS certificates

**Source:** Kubernetes service configuration.

## Environment Issues

### Configuration Not Applied

**Symptom:** Configuration changes not taking effect

**Solutions:**
1. **Check ConfigMap/Secrets:**
   - Verify ConfigMap/Secrets exist
   - Check values are correct
   - Restart pods to reload

2. **Check Environment Variables:**
   - Verify env vars in deployment
   - Check variable names
   - Review value sources

**Source:** Kubernetes configuration in `deployment/kubernetes/configmap.yaml`.

## Scaling Issues

### Auto-Scaling Not Working

**Symptom:** HPA not scaling pods

**Solutions:**
1. **Check HPA Status:**
   ```bash
   kubectl get hpa -n bharatmart
   ```

2. **Check Metrics:**
   - Verify metrics server is running
   - Check CPU/Memory metrics
   - Review HPA targets

3. **Check Resource Limits:**
   - Verify resource requests/limits
   - Check node capacity
   - Review scaling policies

**Source:** HPA configuration in `deployment/kubernetes/backend-deployment.yaml` lines 113-155.

## Next Steps

- [Troubleshooting Overview](01-troubleshooting-overview.md) - Troubleshooting guide
- [Common Issues](02-common-issues.md) - Common problems
- [Database Issues](04-database-issues.md) - Database troubleshooting

