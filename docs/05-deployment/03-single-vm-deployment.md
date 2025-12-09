# Single-VM Deployment

Complete guide for deploying all components on a single virtual machine.

## Overview

**Deployment Mode:** `single-vm`

**Architecture:** All components on one VM

**Use Cases:**
- Development
- Small deployments
- Learning/training
- Proof of concept

**Source:** Single-VM mode in `server/config/deployment.ts` line 22.

## Prerequisites

### VM Requirements

**Minimum:**
- 2 CPU cores
- 4GB RAM
- 20GB disk space
- Ubuntu 20.04+ or similar

**Recommended:**
- 4 CPU cores
- 8GB RAM
- 50GB disk space

**Source:** VM requirements based on component needs.

### Software Requirements

- Node.js 20+
- npm
- Git
- Redis (optional, if using Redis cache/queue)
- PM2 or similar (for process management)

**Source:** Software requirements.

## Installation Steps

### 1. Prepare VM

**Update System:**
```bash
sudo apt update
sudo apt upgrade -y
```

**Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Install Redis (Optional):**
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**Source:** Standard Linux setup procedures.

### 2. Clone Repository

```bash
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
```

**Source:** Git clone command.

### 3. Install Dependencies

```bash
npm install
```

**Source:** Installation in `package.json`.

### 4. Configure Environment

**Create `.env` file:**
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server
PORT=3000
FRONTEND_URL=http://your-vm-ip:5173
NODE_ENV=production

# Deployment Mode
DEPLOYMENT_MODE=single-vm
DATABASE_TYPE=supabase
CACHE_TYPE=memory
WORKER_MODE=in-process
```

**Source:** Environment variables in `docs/04-configuration/01-environment-variables.md`.

### 5. Initialize Database

```bash
npm run db:init
```

**Source:** Database initialization in `package.json` line 8.

### 6. Build Application

```bash
npm run build
```

**Source:** Build script in `package.json` line 12.

### 7. Start Services

**Option 1: PM2 (Recommended)**

**Install PM2:**
```bash
npm install -g pm2
```

**Start Backend:**
```bash
pm2 start npm --name "bharatmart-backend" -- start:server
```

**Start Frontend (if serving):**
```bash
pm2 start npm --name "bharatmart-frontend" -- preview
```

**Save PM2 Configuration:**
```bash
pm2 save
pm2 startup
```

**Source:** PM2 process management.

**Option 2: Systemd**

**Create service file:** `/etc/systemd/system/bharatmart-backend.service`

```ini
[Unit]
Description=BharatMart Backend API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/app
ExecStart=/usr/bin/node dist/server/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Enable and Start:**
```bash
sudo systemctl enable bharatmart-backend
sudo systemctl start bharatmart-backend
```

**Source:** Systemd service configuration.

## Configuration Options

### Cache Configuration

**Memory Cache (Default):**
```bash
CACHE_TYPE=memory
```

**Redis Cache:**
```bash
CACHE_TYPE=redis
CACHE_REDIS_URL=redis://localhost:6379
```

**Source:** Cache configuration in `docs/04-configuration/03-cache-adapters.md`.

### Worker Configuration

**In-Process (Default):**
```bash
WORKER_MODE=in-process
```

**Bull Queue:**
```bash
WORKER_MODE=bull-queue
QUEUE_REDIS_URL=redis://localhost:6379
```

**Source:** Worker configuration in `docs/04-configuration/04-worker-adapters.md`.

## Firewall Configuration

### Open Ports

**Backend API:**
```bash
sudo ufw allow 3000/tcp
```

**Frontend (if serving):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**Metrics (if exposed):**
```bash
sudo ufw allow 9090/tcp
```

**Source:** Firewall configuration.

## Health Checks

### Verify Deployment

**Backend Health:**
```bash
curl http://localhost:3000/api/health
```

**Readiness:**
```bash
curl http://localhost:3000/api/health/ready
```

**Metrics:**
```bash
curl http://localhost:3000/metrics
```

**Source:** Health endpoints in `docs/03-api-reference/06-health-api.md`.

## Monitoring

### Logs

**PM2 Logs:**
```bash
pm2 logs bharatmart-backend
```

**Systemd Logs:**
```bash
sudo journalctl -u bharatmart-backend -f
```

**Application Logs:**
```bash
tail -f logs/api.log
```

**Source:** Logging in `docs/06-observability/03-logging.md`.

### Metrics

**Prometheus (Optional):**
- Install Prometheus
- Configure scrape job
- Point to `/metrics` endpoint

**Source:** Prometheus setup in `deployment/prometheus.yml`.

## Maintenance

### Updates

**Pull Latest Code:**
```bash
git pull
npm install
npm run build
pm2 restart bharatmart-backend
```

**Source:** Update procedure.

### Backups

**Database:**
- Supabase: Automatic backups
- PostgreSQL: Manual backup scripts

**Application:**
- Code: Git repository
- Logs: Rotate logs
- Configuration: Version control

**Source:** Backup strategies.

## Troubleshooting

### Service Won't Start

**Check:**
- Environment variables
- Port availability
- Database connectivity
- Logs for errors

**Source:** Troubleshooting steps.

### High Resource Usage

**Solutions:**
- Increase VM resources
- Optimize configuration
- Use external cache/queue
- Scale to multi-tier

**Source:** Resource optimization.

## Scaling Considerations

### When to Scale

**Indicators:**
- High CPU usage (>80%)
- High memory usage (>80%)
- Slow response times
- Queue backing up

**Source:** Scaling indicators.

### Migration to Multi-Tier

**Steps:**
1. Set up separate VMs
2. Configure network
3. Deploy components
4. Update configuration
5. Migrate data
6. Switch traffic

**Source:** Migration to multi-tier.

## Training vs Production

### Training Mode

**Configuration:** Single-VM with defaults

**Use Case:** Learning, development

### Production Mode

**Recommendation:** Use multi-tier or Kubernetes

**Use Case:** Production deployments

**Source:** Deployment mode selection.

## Next Steps

- [Deployment Overview](01-deployment-overview.md) - Deployment options
- [Multi-Tier Deployment](04-multi-tier-deployment.md) - Multi-tier setup
- [Scaling Guide](08-scaling-guide.md) - Scaling strategies

