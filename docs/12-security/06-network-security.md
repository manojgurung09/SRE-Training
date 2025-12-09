# Network Security

Complete guide to network-level security configuration.

## Overview

**Components:**
- CORS configuration
- HTTPS/TLS
- Firewall rules
- Security groups

**Source:** Network security configuration.

## CORS Configuration

### Backend CORS

**File:** `server/app.ts`

**Configuration:**
```typescript
app.use(cors({
  origin: [
    FRONTEND_URL,
    'http://localhost:5173',
    'http://40.81.230.114:5173',
    'http://localhost:3000',
    'http://40.81.230.114:3000',
  ],
  credentials: true,
}));
```

**Allowed Origins:**
- `FRONTEND_URL` environment variable
- Local development URLs

**Source:** CORS configuration in `server/app.ts` lines 22-31.

### Production CORS

**⚠️ Production Recommendation:**
- Restrict to production frontend URL only
- Remove localhost origins
- Use HTTPS URLs only

**Source:** Production CORS recommendations.

## HTTPS/TLS

### Current Status

**No HTTPS enforcement in code**

**⚠️ Production Note:** Use HTTPS in production (configure at load balancer/ingress level)

**Source:** HTTPS should be configured at infrastructure level.

### TLS Configuration

**Load Balancer:**
- SSL termination at load balancer
- TLS 1.2+ required
- Strong cipher suites

**Ingress (Kubernetes):**
- TLS certificates
- SSL redirect enabled
- HSTS headers

**Source:** TLS configuration examples.

## Firewall Rules

### Backend API

**Allow:**
- Port 3000 from load balancer/frontend
- Port 9090 from Prometheus
- Port 22 (SSH) from management network

**Deny:**
- All other ports
- Direct internet access (use load balancer)

**Source:** Firewall rule recommendations.

### Database

**Allow:**
- Port 5432 from backend VMs only
- Port 22 (SSH) from management network

**Deny:**
- Internet access
- Other VMs

**Source:** Database firewall rules.

### Redis

**Allow:**
- Port 6379 from backend/workers only
- Port 22 (SSH) from management network

**Deny:**
- Internet access
- Other VMs

**Source:** Redis firewall rules.

## Security Groups (OCI)

### Backend Security List

**Inbound Rules:**
- TCP 3000 from load balancer subnet
- TCP 9090 from Prometheus subnet
- TCP 22 from management subnet

**Outbound Rules:**
- All traffic (or restrict to specific destinations)

**Source:** OCI Security List configuration.

### Database Security List

**Inbound Rules:**
- TCP 5432 from backend subnet
- TCP 22 from management subnet

**Outbound Rules:**
- None (or restrict to specific destinations)

**Source:** Database Security List configuration.

## Network Segmentation

### VCN Design

**Subnets:**
- Public subnet (load balancer)
- Private subnet (backend, workers)
- Database subnet (isolated)
- Management subnet (bastion)

**Source:** Network segmentation best practices.

## Training vs Production

### Training Mode

**Network:** Simplified for learning

**Use Case:** Learning network security concepts

### Production Mode

**Network:** Full security hardening

**Use Case:** Production deployments

**⚠️ Production Warning:** Review and harden network security before production deployment

**Source:** Network security mode differences.

## Next Steps

- [Security Overview](01-security-overview.md) - Security overview
- [Deployment Guides](../05-deployment/) - Deployment security
- [Configuration: Environment Variables](../04-configuration/01-environment-variables.md) - Network configuration

