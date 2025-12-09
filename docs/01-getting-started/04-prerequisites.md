# Prerequisites

Complete list of requirements, tools, accounts, and knowledge needed to work with BharatMart.

## Required Software

### Node.js

**Version:** Node.js 20.0.0 or higher

**Check Installation:**
```bash
node --version
```

**Installation:**
- **macOS/Linux:** Use [nvm](https://github.com/nvm-sh/nvm) or download from [nodejs.org](https://nodejs.org/)
- **Windows:** Download installer from [nodejs.org](https://nodejs.org/)

**Source:** Node.js version requirement inferred from TypeScript and package dependencies.

### npm

**Version:** npm 9.0.0 or higher (comes with Node.js)

**Check Installation:**
```bash
npm --version
```

**Update to Latest:**
```bash
npm install -g npm@latest
```

**Source:** npm is bundled with Node.js installation.

### Git

**Version:** Git 2.0.0 or higher

**Check Installation:**
```bash
git --version
```

**Installation:**
- **macOS:** `brew install git` or download from [git-scm.com](https://git-scm.com/)
- **Linux:** `sudo apt install git` (Ubuntu/Debian) or `sudo yum install git` (RHEL/CentOS)
- **Windows:** Download from [git-scm.com](https://git-scm.com/)

## Required Accounts

### Supabase Account

**Purpose:** Database and authentication

**Free Tier:** Available (500MB database, 1GB bandwidth)

**Sign Up:** [supabase.com](https://supabase.com/)

**Required Credentials:**
- `SUPABASE_URL` - Project URL
- `SUPABASE_ANON_KEY` - Anonymous key (frontend)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend)

**Source:** Supabase configuration in `server/config/supabase.ts` lines 17-18.

### Optional: Redis Account

**Purpose:** Cache and queue (if not using in-process mode)

**Options:**
- Local Redis installation
- Redis Cloud (free tier available)
- OCI Redis (if using Oracle Cloud)

**Required Only If:**
- `CACHE_TYPE=redis` OR
- `WORKER_MODE=bull-queue`

**Source:** Redis usage conditional on `CACHE_TYPE` and `WORKER_MODE` in `server/config/redis.ts` and `server/config/queue.ts`.

### Optional: OCI Account

**Purpose:** Production deployment on Oracle Cloud Infrastructure

**Required Only If:** Deploying to OCI

**Sign Up:** [cloud.oracle.com](https://cloud.oracle.com/)

## Required Knowledge

### Basic Knowledge

- **Command Line:** Basic terminal/command prompt usage
- **Git:** Basic git commands (clone, pull, commit)
- **HTTP:** Understanding of REST APIs
- **JSON:** Reading and writing JSON

### Recommended Knowledge

- **Node.js:** Basic understanding of Node.js and npm
- **TypeScript:** Basic TypeScript syntax
- **React:** Basic React concepts (for frontend development)
- **PostgreSQL:** Basic SQL (for database operations)
- **Docker:** Basic Docker concepts (for containerized deployment)

### Advanced Knowledge (Optional)

- **Kubernetes:** For Kubernetes deployment
- **Prometheus:** For metrics and monitoring
- **OpenTelemetry:** For distributed tracing
- **SRE Practices:** For production operations

## Optional Tools

### Development Tools

- **VS Code** - Recommended IDE with TypeScript support
- **Postman/Insomnia** - API testing
- **Redis CLI** - Redis management (if using Redis)
- **pgAdmin/DBeaver** - Database management (if using PostgreSQL directly)

### Monitoring Tools

- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **Jaeger/Zipkin** - Trace visualization (if using OpenTelemetry)

### Deployment Tools

- **Docker** - Containerization
- **kubectl** - Kubernetes management (if using Kubernetes)
- **OCI CLI** - Oracle Cloud Infrastructure management (if using OCI)

## System Requirements

### Local Development

**Minimum:**
- **CPU:** 2 cores
- **RAM:** 4GB
- **Disk:** 10GB free space
- **OS:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

**Recommended:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Disk:** 20GB free space

### Production Deployment

**Single-VM:**
- **CPU:** 2-4 cores
- **RAM:** 4-8GB
- **Disk:** 20GB+

**Multi-Tier:**
- **Frontend VM:** 1-2 cores, 2GB RAM
- **Backend VM:** 2-4 cores, 4GB RAM (per instance)
- **Worker VM:** 2-4 cores, 4GB RAM (per instance)
- **Cache VM:** 2 cores, 4GB RAM
- **Queue VM:** 2 cores, 4GB RAM

**Source:** System requirements based on typical Node.js application needs and deployment patterns.

## Environment-Specific Requirements

### Development

- Local Supabase project OR
- Local PostgreSQL + Redis (if not using Supabase)

### Production

- Production Supabase project OR
- Production PostgreSQL database
- Production Redis (if using cache/queue)
- Domain name and SSL certificate (for HTTPS)
- Monitoring infrastructure (Prometheus, Grafana)

### Training

- Same as Development
- Chaos engineering enabled (`CHAOS_ENABLED=true`)
- Access to monitoring tools for observability labs

**Source:** Training mode configuration in `server/middleware/metricsMiddleware.ts` line 7.

## Verification Checklist

Before starting, verify:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Supabase credentials obtained
- [ ] (Optional) Redis installed/configured
- [ ] (Optional) Docker installed (for containerized deployment)
- [ ] (Optional) kubectl installed (for Kubernetes deployment)

## Next Steps

Once prerequisites are met:

1. [Quick Start Guide](02-quick-start.md) - Get the application running
2. [Architecture Overview](03-architecture-overview.md) - Understand the system
3. [Configuration Guide](../04-configuration/) - Configure for your needs
4. [Deployment Guides](../05-deployment/) - Deploy to production

