# Multi-Tier Deployment

Complete guide for deploying components across separate virtual machines.

## Overview

**Deployment Mode:** `multi-tier`

**Architecture:** Separate VMs per tier

**Tiers:**
- Tier 1: Frontend (React SPA)
- Tier 2: Backend API (Express.js)
- Tier 3: Database (Supabase/PostgreSQL/OCI)
- Tier 4: Cache (Redis)
- Tier 5: Workers (Bull Queue)
- Tier 6: Observability (Prometheus, Grafana)

**Source:** Multi-tier architecture in `docs/02-architecture/01-system-architecture.md`.

## Architecture

### Tier Layout

```
┌─────────────┐
│  Tier 1:    │
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │
┌──────▼──────┐
│  Tier 2:    │
│  Backend    │
│  (Express)  │
└──┬──────┬───┘
   │      │
┌──▼──┐ ┌─▼────┐
│Tier3│ │Tier4 │
│ DB  │ │Cache │
└─────┘ └──────┘
   │
┌──▼──────┐
│ Tier 5: │
│ Workers │
└─────────┘
```

**Source:** Multi-tier architecture diagram.

## Prerequisites

### VM Requirements

**Frontend VM:**
- 1 CPU core
- 2GB RAM
- 10GB disk
- Nginx or similar web server

**Backend VM:**
- 2 CPU cores
- 4GB RAM
- 20GB disk
- Node.js 20+

**Cache VM:**
- 1 CPU core
- 2GB RAM
- 10GB disk
- Redis

**Queue VM:**
- 1 CPU core
- 2GB RAM
- 10GB disk
- Redis

**Worker VMs:**
- 1 CPU core per worker
- 2GB RAM
- 10GB disk
- Node.js 20+

**Source:** VM requirements based on component needs.

## Deployment Steps

### Tier 1: Frontend

**1. Set Up VM:**
```bash
# Install Nginx
sudo apt update
sudo apt install -y nginx

# Install Node.js (for build)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**2. Build Frontend:**
```bash
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
npm install
npm run build:client
```

**3. Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**4. Deploy:**
```bash
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

**Source:** Frontend deployment steps.

### Tier 2: Backend API

**1. Set Up VM:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
npm install -g pm2
```

**2. Deploy Application:**
```bash
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
npm install
npm run build:server
```

**3. Configure Environment:**
```bash
# .env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
CACHE_REDIS_URL=redis://cache-vm-ip:6379
QUEUE_REDIS_URL=redis://queue-vm-ip:6379
DEPLOYMENT_MODE=multi-tier
CACHE_TYPE=redis
WORKER_MODE=bull-queue
```

**4. Start Service:**
```bash
pm2 start npm --name "bharatmart-backend" -- start:server
pm2 save
pm2 startup
```

**Source:** Backend deployment steps.

### Tier 4: Cache (Redis)

**1. Set Up VM:**
```bash
sudo apt update
sudo apt install -y redis-server
```

**2. Configure Redis:**
```bash
# /etc/redis/redis.conf
bind 0.0.0.0
maxmemory 512mb
maxmemory-policy allkeys-lru
```

**3. Start Redis:**
```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**4. Configure Firewall:**
```bash
sudo ufw allow from backend-vm-ip to any port 6379
```

**Source:** Redis cache setup.

### Tier 5: Queue (Redis)

**1. Set Up VM:**
```bash
sudo apt update
sudo apt install -y redis-server
```

**2. Configure Redis:**
```bash
# /etc/redis/redis.conf
bind 0.0.0.0
appendonly yes
```

**3. Start Redis:**
```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**4. Configure Firewall:**
```bash
sudo ufw allow from backend-vm-ip to any port 6379
sudo ufw allow from worker-vm-ip to any port 6379
```

**Source:** Redis queue setup.

### Tier 5: Workers

**1. Set Up VM:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
npm install -g pm2
```

**2. Deploy Workers:**
```bash
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
npm install
npm run build:server
```

**3. Configure Environment:**
```bash
# .env
NODE_ENV=production
WORKER_TYPE=email  # or order, payment, all
WORKER_CONCURRENCY=5
QUEUE_REDIS_URL=redis://queue-vm-ip:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
```

**4. Start Workers:**
```bash
pm2 start npm --name "bharatmart-worker-email" -- start:worker:email
pm2 start npm --name "bharatmart-worker-order" -- start:worker:order
pm2 start npm --name "bharatmart-worker-payment" -- start:worker:payment
pm2 save
pm2 startup
```

**Source:** Worker deployment steps.

## Load Balancing

### Backend Load Balancer

**OCI Load Balancer:**
- Create load balancer
- Add backend servers
- Configure health checks
- Set up SSL termination

**Health Check:**
- Path: `/api/health`
- Interval: 30s
- Timeout: 5s
- Unhealthy threshold: 3

**Source:** Load balancer configuration.

## Network Configuration

### Security Groups

**Backend VM:**
- Allow 3000 from load balancer
- Allow 9090 from Prometheus
- Allow 22 (SSH) from management

**Cache VM:**
- Allow 6379 from backend
- Allow 22 (SSH) from management

**Queue VM:**
- Allow 6379 from backend and workers
- Allow 22 (SSH) from management

**Source:** Security group configuration.

## Monitoring

### Prometheus Setup

**1. Install Prometheus:**
```bash
# On monitoring VM
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
```

**2. Configure:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'backend-api'
    static_configs:
      - targets: ['backend-vm-ip:3000']
```

**3. Start:**
```bash
./prometheus --config.file=prometheus.yml
```

**Source:** Prometheus configuration in `deployment/prometheus.yml`.

## High Availability

### Backend HA

**Strategy:**
- Multiple backend VMs
- Load balancer
- Health checks
- Auto-scaling

**Source:** High availability strategies.

### Redis HA

**Strategy:**
- Redis Sentinel
- Redis Cluster
- Master-slave replication

**Source:** Redis high availability.

## Troubleshooting

### Connection Issues

**Check:**
- Network connectivity
- Firewall rules
- Security groups
- Service status

**Source:** Network troubleshooting.

### Performance Issues

**Check:**
- VM resources
- Network latency
- Cache hit rates
- Queue depth

**Source:** Performance troubleshooting.

## Training vs Production

### Training Mode

**Configuration:** Simplified multi-tier

**Use Case:** Learning multi-tier concepts

### Production Mode

**Configuration:** Full multi-tier with HA

**Use Case:** Production deployments

**Source:** Deployment mode differences.

## Next Steps

- [Deployment Overview](01-deployment-overview.md) - Deployment options
- [Kubernetes Deployment](05-kubernetes-deployment.md) - Kubernetes setup
- [Scaling Guide](08-scaling-guide.md) - Scaling strategies

