# Architecture Overview

High-level architecture of the BharatMart e-commerce platform.

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Layer 1: FRONTEND                           │
│         React SPA (Vite + TypeScript)                    │
│         Port: 5173 (dev) / 80 (production)              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Layer 2: API GATEWAY (Express.js)                │
│         Port: 3000                                        │
│         Middleware: Metrics, Logging, Cache, Auth        │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ Database │  │  Cache   │  │   Workers    │
│ Supabase │  │ Memory/   │  │ Email/Order/ │
│          │  │ Redis    │  │ Payment      │
└──────────┘  └──────────┘  └──────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   Observability       │
         │ Prometheus + OTLP     │
         └──────────────────────┘
```

**Source:** Architecture derived from:
- Frontend: `src/main.tsx`, `src/App.tsx`
- Backend: `server/app.ts`, `server/index.ts`
- Database: `server/config/supabase.ts`
- Cache: `server/config/redis.ts`
- Workers: `server/workers/index.ts`
- Observability: `server/config/metrics.ts`, `server/tracing.ts`

## Component Overview

### Frontend Layer

**Technology:** React 18.3 + TypeScript + Vite 5.4

**Key Components:**
- `src/App.tsx` - Main application component
- `src/components/ProductCatalog.tsx` - Product browsing
- `src/components/ShoppingCart.tsx` - Cart management
- `src/components/Checkout.tsx` - Order placement
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/contexts/CartContext.tsx` - Cart state

**Source:** Component structure in `src/` directory.

### Backend Layer

**Technology:** Express.js 4.18 + Node.js 20+ + TypeScript

**Key Components:**
- `server/app.ts` - Express application setup
- `server/index.ts` - Server entry point
- `server/routes/` - API route handlers
- `server/middleware/` - Request processing middleware
- `server/adapters/` - Infrastructure adapters

**Source:** Backend structure in `server/` directory.

### Database Layer

**Default:** Supabase (managed PostgreSQL)

**Adapters:**
- `server/adapters/database/supabase.ts` - Supabase adapter
- `server/adapters/database/postgresql.ts` - Direct PostgreSQL
- `server/adapters/database/oci-autonomous.ts` - OCI Autonomous

**Selection:** Via `DATABASE_TYPE` environment variable (default: `supabase`)

**Source:** Database adapter selection in `server/adapters/database/index.ts` lines 30-43.

### Cache Layer

**Default:** Memory (in-process)

**Adapters:**
- `server/adapters/cache/memory.ts` - In-memory cache
- `server/adapters/cache/redis.ts` - Redis cache

**Selection:** Via `CACHE_TYPE` environment variable (default: `memory`)

**Source:** Cache adapter selection in `server/adapters/cache/index.ts` lines 13-26.

### Worker Layer

**Default:** In-process (synchronous)

**Adapters:**
- `server/adapters/workers/in-process.ts` - Synchronous processing
- `server/adapters/workers/bull-queue.ts` - Bull Queue with Redis
- `server/adapters/workers/noop.ts` - No processing

**Worker Types:**
- `server/workers/emailWorker.ts` - Email notifications
- `server/workers/orderWorker.ts` - Order processing
- `server/workers/paymentWorker.ts` - Payment processing

**Selection:** Via `WORKER_MODE` environment variable (default: `in-process`)

**Source:** Worker adapter selection in `server/adapters/workers/index.ts` lines 18-32.

### Observability Layer

**Components:**
- **Metrics:** Prometheus (`server/config/metrics.ts`)
- **Logging:** Winston (`server/config/logger.ts`)
- **Tracing:** OpenTelemetry (`server/tracing.ts`)

**Source:** Observability configuration in respective config files.

## Data Flow

### Request Flow

1. **Client Request** → Frontend (React)
2. **API Call** → Backend API Gateway (Express)
3. **Middleware Stack:**
   - Metrics middleware (`server/middleware/metricsMiddleware.ts`)
   - Logging middleware (`server/middleware/logger.ts`)
   - Cache middleware (`server/middleware/cache.ts`) - if GET request
4. **Route Handler** → `server/routes/*`
5. **Database/Cache** → Supabase/Redis
6. **Response** → Client

**Source:** Request flow derived from middleware order in `server/app.ts` lines 36-37.

### Order Processing Flow

1. **Order Creation** → `POST /api/orders` (`server/routes/orders.ts` line 87)
2. **Queue Job** → `queueService.addOrderToQueue()` (`server/routes/orders.ts` line 147)
3. **Worker Processing** → `server/workers/orderWorker.ts`
4. **Email Notification** → `server/workers/emailWorker.ts`

**Source:** Order processing flow in `server/routes/orders.ts` and `server/workers/orderWorker.ts`.

## Technology Stack

### Frontend Stack

- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icons

**Source:** Dependencies in `package.json` lines 49-50, 74.

### Backend Stack

- **Express.js 4.18** - Web framework
- **Node.js 20+** - Runtime
- **TypeScript 5.5** - Type safety
- **Winston 3.11** - Logging
- **prom-client 15.1** - Metrics
- **@opentelemetry/sdk-node 0.51.0** - Tracing
- **Bull 4.16** - Job queue
- **ioredis 5.8** - Redis client

**Source:** Dependencies in `package.json` lines 30-52.

### Infrastructure Stack

- **Supabase** - Database & Auth
- **Redis** - Cache & Queue
- **Prometheus** - Metrics
- **OpenTelemetry** - Tracing

## Deployment Modes

### Single-VM Mode

All components on one virtual machine.

**Source:** Deployment mode selection in `server/config/deployment.ts` line 22.

### Multi-Tier Mode

Separate VMs for each tier (frontend, backend, workers, cache).

**Source:** Deployment mode selection in `server/config/deployment.ts` line 22.

### Kubernetes Mode

Full container orchestration with pods, services, and ingress.

**Source:** Kubernetes manifests in `deployment/kubernetes/`.

## Link to Detailed Architecture

For detailed architecture documentation:

- [System Architecture](../02-architecture/01-system-architecture.md)
- [Backend Architecture](../02-architecture/02-backend-architecture.md)
- [Frontend Architecture](../02-architecture/03-frontend-architecture.md)
- [Database Architecture](../02-architecture/04-database-architecture.md)
- [Cache Architecture](../02-architecture/05-cache-architecture.md)
- [Worker Architecture](../02-architecture/06-worker-architecture.md)
- [Deployment Modes](../02-architecture/07-deployment-modes.md)

