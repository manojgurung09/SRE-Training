# Environment Variables

Complete reference of all environment variables, required vs optional, and defaults.

## Required Variables

### Database Configuration

#### SUPABASE_URL

**Type:** URL (string)

**Required:** Yes (if using Supabase)

**Purpose:** Supabase project URL

**Example:**
```bash
SUPABASE_URL=https://your-project.supabase.co
```

**Source:** Supabase URL usage in `server/config/supabase.ts` line 17.

#### SUPABASE_SERVICE_ROLE_KEY

**Type:** JWT (string)

**Required:** Yes (if using Supabase)

**Purpose:** Supabase service role key for backend operations

**Validation:** Must start with `eyJhbGciOi` (JWT format)

**Example:**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Source:** Service role key usage in `server/config/supabase.ts` line 18. Validation in lines 28-33.

## Optional Variables

### Server Configuration

#### PORT

**Type:** Number

**Default:** `3000`

**Purpose:** Server port

**Example:**
```bash
PORT=3000
```

**Source:** Port configuration in `server/index.ts` line 10.

#### NODE_ENV

**Type:** String

**Default:** `development`

**Purpose:** Node.js environment

**Options:** `development`, `production`, `test`

**Example:**
```bash
NODE_ENV=production
```

**Source:** Environment variable used throughout configuration files.

#### FRONTEND_URL

**Type:** URL (string)

**Default:** `http://localhost:5173`

**Purpose:** Frontend URL for CORS configuration

**Example:**
```bash
FRONTEND_URL=https://yourdomain.com
```

**Source:** Frontend URL in `server/app.ts` line 20.

### Database Configuration

#### DATABASE_TYPE

**Type:** String

**Default:** `supabase`

**Options:** `supabase`, `postgresql`, `oci-autonomous`, `mysql`

**Purpose:** Database adapter selection

**Example:**
```bash
DATABASE_TYPE=postgresql
```

**Source:** Database type in `server/config/deployment.ts` line 25.

#### DATABASE_URL

**Type:** Connection String

**Required:** Yes (if using PostgreSQL directly)

**Purpose:** PostgreSQL connection string

**Example:**
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Source:** Database URL would be used by PostgreSQL adapter.

### Cache Configuration

#### CACHE_TYPE

**Type:** String

**Default:** `memory`

**Options:** `memory`, `redis`, `oci-cache`

**Purpose:** Cache adapter selection

**Example:**
```bash
CACHE_TYPE=redis
```

**Source:** Cache type in `server/config/deployment.ts` line 27.

#### REDIS_URL

**Type:** Connection String

**Required:** Yes (if `CACHE_TYPE=redis`)

**Default:** `redis://localhost:6379`

**Purpose:** Redis connection URL for cache

**Example:**
```bash
REDIS_URL=redis://localhost:6379
```

**Source:** Redis URL in `server/config/redis.ts` line 5.

#### CACHE_REDIS_URL

**Type:** Connection String

**Required:** Yes (if using Redis cache)

**Purpose:** Redis connection URL specifically for cache

**Example:**
```bash
CACHE_REDIS_URL=redis://cache-host:6379
```

**Source:** Cache Redis URL in `server/adapters/cache/redis.ts` line 9.

### Worker Configuration

#### WORKER_MODE

**Type:** String

**Default:** `in-process`

**Options:** `in-process`, `bull-queue`, `none`

**Purpose:** Worker adapter selection

**Example:**
```bash
WORKER_MODE=bull-queue
```

**Source:** Worker mode in `server/config/deployment.ts` line 26.

#### QUEUE_REDIS_URL

**Type:** Connection String

**Required:** Yes (if `WORKER_MODE=bull-queue`)

**Default:** `redis://localhost:6379`

**Purpose:** Redis connection URL for job queue

**Example:**
```bash
QUEUE_REDIS_URL=redis://queue-host:6379
```

**Source:** Queue Redis URL in `server/config/queue.ts` line 4.

#### WORKER_TYPE

**Type:** String

**Default:** `all`

**Options:** `email`, `order`, `payment`, `all`

**Purpose:** Worker type to run

**Example:**
```bash
WORKER_TYPE=email
```

**Source:** Worker type in `server/workers/index.ts` line 6.

#### WORKER_CONCURRENCY

**Type:** Number

**Default:** `5`

**Purpose:** Number of concurrent jobs per worker

**Example:**
```bash
WORKER_CONCURRENCY=10
```

**Source:** Worker concurrency in `server/adapters/workers/bull-queue.ts` line 41.

### Observability Configuration

#### LOG_LEVEL

**Type:** String

**Default:** `info`

**Options:** `error`, `warn`, `info`, `debug`, `silly`

**Purpose:** Winston log level

**Example:**
```bash
LOG_LEVEL=debug
```

**Source:** Log level in `server/config/logger.ts` line 55.

#### LOG_FILE

**Type:** File Path

**Default:** `logs/api.log` (relative to project root)

**Purpose:** Log file path

**Example:**
```bash
LOG_FILE=/var/log/bharatmart/api.log
```

**Source:** Log file path in `server/config/logger.ts` lines 13-15.

#### OTEL_EXPORTER_OTLP_ENDPOINT

**Type:** URL (string)

**Required:** No (tracing is optional)

**Purpose:** OpenTelemetry OTLP collector endpoint

**Example:**
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

**Source:** OTLP endpoint in `server/tracing.ts` line 13.

#### OTEL_SERVICE_NAME

**Type:** String

**Default:** `bharatmart-backend`

**Purpose:** Service name for traces

**Example:**
```bash
OTEL_SERVICE_NAME=bharatmart-api
```

**Source:** Service name in `server/tracing.ts` line 12.

### Chaos Engineering Configuration

#### CHAOS_ENABLED

**Type:** Boolean (string)

**Default:** Not set (disabled)

**Options:** `true`, `false`

**Purpose:** Enable chaos engineering

**Example:**
```bash
CHAOS_ENABLED=true
```

**Source:** Chaos enabled in `server/middleware/metricsMiddleware.ts` line 7.

#### CHAOS_LATENCY_MS

**Type:** Number (milliseconds)

**Default:** `0`

**Purpose:** Latency to inject in milliseconds

**Example:**
```bash
CHAOS_LATENCY_MS=100
```

**Source:** Chaos latency in `server/middleware/metricsMiddleware.ts` line 8.

### Deployment Configuration

#### DEPLOYMENT_MODE

**Type:** String

**Default:** `single-vm`

**Options:** `single-vm`, `multi-tier`, `kubernetes`

**Purpose:** Deployment mode selection

**Example:**
```bash
DEPLOYMENT_MODE=multi-tier
```

**Source:** Deployment mode in `server/config/deployment.ts` line 22.

#### SECRETS_PROVIDER

**Type:** String

**Default:** `env`

**Options:** `env`, `oci-vault`, `aws-secrets`, `azure-keyvault`

**Purpose:** Secrets provider selection

**Example:**
```bash
SECRETS_PROVIDER=oci-vault
```

**Source:** Secrets provider in `server/config/deployment.ts` line 23.

## Frontend Variables

### VITE_SUPABASE_URL

**Type:** URL (string)

**Required:** Yes (for frontend)

**Purpose:** Supabase project URL for frontend

**Example:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
```

**Source:** Frontend Supabase URL in `src/lib/supabase.ts` line 3.

### VITE_SUPABASE_ANON_KEY

**Type:** String

**Required:** Yes (for frontend)

**Purpose:** Supabase anonymous key for frontend

**Example:**
```bash
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Source:** Frontend Supabase key in `src/lib/supabase.ts` line 4.

## Variable Categories

### Database Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_TYPE`
- `DATABASE_URL`

### Cache Variables
- `CACHE_TYPE`
- `REDIS_URL`
- `CACHE_REDIS_URL`

### Worker Variables
- `WORKER_MODE`
- `QUEUE_REDIS_URL`
- `WORKER_TYPE`
- `WORKER_CONCURRENCY`

### Observability Variables
- `LOG_LEVEL`
- `LOG_FILE`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`

### Chaos Variables
- `CHAOS_ENABLED`
- `CHAOS_LATENCY_MS`

### Deployment Variables
- `DEPLOYMENT_MODE`
- `SECRETS_PROVIDER`

## Configuration Examples

### Minimal Configuration (Development)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Source:** Minimal configuration uses Supabase defaults.

### Production Configuration

```bash
NODE_ENV=production
PORT=3000
DATABASE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
WORKER_MODE=bull-queue
QUEUE_REDIS_URL=redis://queue-host:6379
CACHE_TYPE=redis
CACHE_REDIS_URL=redis://cache-host:6379
LOG_LEVEL=info
LOG_FILE=/var/log/bharatmart/api.log
CHAOS_ENABLED=false
```

**Source:** Production configuration example.

## Validation Rules

### Supabase Service Role Key

**Validation:** Must start with `eyJhbGciOi` (JWT format)

**Error:** Application exits if invalid format

**Source:** Validation in `server/config/supabase.ts` lines 28-33.

### Required Variables

**Validation:** Application exits if required variables are missing

**Error:** Clear error message indicating missing variable

**Source:** Validation in `server/config/supabase.ts` lines 21-25.

## Default Values

All defaults are defined in:

- `server/config/deployment.ts` - Deployment configuration defaults
- `server/config/logger.ts` - Logging defaults
- `server/config/redis.ts` - Redis defaults
- `server/config/queue.ts` - Queue defaults
- `server/tracing.ts` - Tracing defaults

**Source:** Default values in respective configuration files.

## Next Steps

- [Database Adapters](02-database-adapters.md) - Database adapter configuration
- [Cache Adapters](03-cache-adapters.md) - Cache adapter configuration
- [Worker Adapters](04-worker-adapters.md) - Worker adapter configuration
- [Secrets Management](05-secrets-management.md) - Secrets provider configuration
- [Deployment Configuration](06-deployment-configuration.md) - Deployment mode configuration

