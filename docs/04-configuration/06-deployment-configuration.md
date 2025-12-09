# Deployment Configuration

Deployment mode configuration and infrastructure selection.

## Overview

**Configuration File:** `server/config/deployment.ts`

**Purpose:** Centralized deployment configuration

**Source:** Deployment configuration in `server/config/deployment.ts`.

## Deployment Modes

### Single-VM Mode

**Configuration:**
```bash
DEPLOYMENT_MODE=single-vm
```

**Default:** Yes

**Characteristics:**
- All components on one VM
- Simple setup
- Suitable for development

**Source:** Single-VM mode in `server/config/deployment.ts` lines 5, 22.

### Multi-Tier Mode

**Configuration:**
```bash
DEPLOYMENT_MODE=multi-tier
```

**Characteristics:**
- Separate VMs per tier
- Scalable architecture
- Production-ready

**Source:** Multi-tier mode in `server/config/deployment.ts` lines 5, 22.

### Kubernetes Mode

**Configuration:**
```bash
DEPLOYMENT_MODE=kubernetes
```

**Characteristics:**
- Container orchestration
- Auto-scaling
- High availability

**Source:** Kubernetes mode in `server/config/deployment.ts` lines 5, 22.

## Infrastructure Selection

### Database Type

**Configuration:** `DATABASE_TYPE`

**Options:**
- `supabase` - Supabase (default)
- `postgresql` - PostgreSQL
- `oci-autonomous` - OCI Autonomous Database
- `mysql` - MySQL

**Source:** Database type in `server/config/deployment.ts` lines 8, 25.

### Cache Type

**Configuration:** `CACHE_TYPE`

**Options:**
- `memory` - In-process memory (default)
- `redis` - Redis
- `oci-cache` - OCI Cache
- `memcached` - Memcached

**Source:** Cache type in `server/config/deployment.ts` lines 10, 27.

### Worker Mode

**Configuration:** `WORKER_MODE`

**Options:**
- `in-process` - Synchronous processing (default)
- `bull-queue` - Bull Queue with Redis
- `oci-queue` - OCI Queue
- `sqs` - AWS SQS
- `none` - No workers

**Source:** Worker mode in `server/config/deployment.ts` lines 9, 26.

### Secrets Provider

**Configuration:** `SECRETS_PROVIDER`

**Options:**
- `env` - Environment variables (default)
- `oci-vault` - OCI Vault
- `aws-secrets` - AWS Secrets Manager
- `azure-keyvault` - Azure Key Vault

**Source:** Secrets provider in `server/config/deployment.ts` lines 6, 23.

### Config Provider

**Configuration:** `CONFIG_PROVIDER`

**Options:**
- `env` - Environment variables (default)
- `oci-app-config` - OCI Application Configuration
- `aws-appconfig` - AWS AppConfig

**Source:** Config provider in `server/config/deployment.ts` lines 7, 24.

## Helper Functions

### Mode Checks

**Functions:**
- `isSingleVM()` - Check if single-VM mode
- `isMultiTier()` - Check if multi-tier mode
- `isKubernetes()` - Check if Kubernetes mode

**Source:** Helper functions in `server/config/deployment.ts` lines 30-40.

### Feature Checks

**Functions:**
- `shouldUseWorkers()` - Check if workers should be used
- `shouldUseExternalCache()` - Check if external cache should be used

**Source:** Helper functions in `server/config/deployment.ts` lines 42-48.

## Configuration Logging

### Startup Logging

**Output:**
```
🚀 Deployment Configuration: {
  mode: 'single-vm',
  database: 'supabase',
  workers: 'in-process',
  cache: 'memory',
  secrets: 'env'
}
```

**Source:** Configuration logging in `server/config/deployment.ts` lines 50-56.

## Configuration Examples

### Development Configuration

```bash
DEPLOYMENT_MODE=single-vm
DATABASE_TYPE=supabase
CACHE_TYPE=memory
WORKER_MODE=in-process
SECRETS_PROVIDER=env
CONFIG_PROVIDER=env
```

**Source:** Development configuration example.

### Production Configuration

```bash
DEPLOYMENT_MODE=multi-tier
DATABASE_TYPE=supabase
CACHE_TYPE=redis
WORKER_MODE=bull-queue
SECRETS_PROVIDER=oci-vault
CONFIG_PROVIDER=oci-app-config
```

**Source:** Production configuration example.

### Kubernetes Configuration

```bash
DEPLOYMENT_MODE=kubernetes
DATABASE_TYPE=oci-autonomous
CACHE_TYPE=redis
WORKER_MODE=bull-queue
SECRETS_PROVIDER=oci-vault
CONFIG_PROVIDER=oci-app-config
```

**Source:** Kubernetes configuration example.

## Training vs Production

### Training Mode

**Default:** Single-VM with environment variables

**Use Case:** Learning, development, SRE training

### Production Mode

**Recommended:** Multi-tier or Kubernetes with managed services

**Use Case:** Production deployments, scalability, high availability

**Source:** Deployment mode selection based on requirements.

## Next Steps

- [Environment Variables](01-environment-variables.md) - Complete environment variable reference
- [Deployment Modes](../02-architecture/07-deployment-modes.md) - Detailed deployment mode documentation
- [Deployment Guides](../05-deployment/) - Step-by-step deployment instructions

