# System Architecture

Complete system-level architecture covering all layers and components.

## Multi-Tier Architecture

The platform follows a 6-layer architecture:

```
Layer 1: Frontend (React SPA)
    ↓
Layer 2: API Gateway (Express.js)
    ↓
Layer 3: Database (Supabase/PostgreSQL/OCI)
    ↓
Layer 4: Cache (Memory/Redis)
    ↓
Layer 5: Workers (In-Process/Bull Queue)
    ↓
Layer 6: Observability (Prometheus/OTLP)
```

**Source:** Architecture derived from component structure and deployment configuration.

## Layer 1: Frontend

**Technology:** React 18.3 + TypeScript + Vite 5.4

**Entry Point:** `src/main.tsx`

**Main Component:** `src/App.tsx`

**Key Features:**
- Product catalog browsing
- Shopping cart management
- Order placement and tracking
- User authentication
- Admin panel

**Source:** Frontend structure in `src/` directory.

## Layer 2: API Gateway

**Technology:** Express.js 4.18 + Node.js 20+ + TypeScript

**Entry Point:** `server/index.ts` → `server/app.ts`

**Port:** 3000 (configurable via `PORT`)

**Middleware Stack (Order):**
1. CORS middleware
2. JSON body parser
3. URL-encoded body parser
4. Metrics middleware
5. Logging middleware
6. Route handlers
7. Error handler
8. Not found handler

**Source:** Middleware order in `server/app.ts` lines 22-37, 72-73.

## Layer 3: Database

**Default:** Supabase (managed PostgreSQL)

**Adapters:**
- `server/adapters/database/supabase.ts` - Supabase adapter
- `server/adapters/database/postgresql.ts` - Direct PostgreSQL
- `server/adapters/database/oci-autonomous.ts` - OCI Autonomous

**Selection:** Via `DATABASE_TYPE` environment variable

**Tables:**
- `users` - User profiles
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment transactions
- `inventory_logs` - Inventory change logs

**Source:** Database adapter selection in `server/adapters/database/index.ts` lines 30-43. Schema in `supabase/migrations/00000000000002_base_schema.sql`.

## Layer 4: Cache

**Default:** Memory (in-process)

**Adapters:**
- `server/adapters/cache/memory.ts` - In-memory cache
- `server/adapters/cache/redis.ts` - Redis cache

**Selection:** Via `CACHE_TYPE` environment variable

**Usage:**
- Product list caching (300s TTL)
- Product detail caching (600s TTL)
- Order list caching (60s TTL)
- Order detail caching (120s TTL)

**Source:** Cache adapter selection in `server/adapters/cache/index.ts` lines 13-26. Cache usage in route handlers.

## Layer 5: Workers

**Default:** In-process (synchronous)

**Adapters:**
- `server/adapters/workers/in-process.ts` - Synchronous processing
- `server/adapters/workers/bull-queue.ts` - Bull Queue with Redis
- `server/adapters/workers/noop.ts` - No processing

**Worker Types:**
- `server/workers/emailWorker.ts` - Email notifications
- `server/workers/orderWorker.ts` - Order processing
- `server/workers/paymentWorker.ts` - Payment processing

**Selection:** Via `WORKER_MODE` environment variable

**Source:** Worker adapter selection in `server/adapters/workers/index.ts` lines 18-32.

## Layer 6: Observability

**Components:**
- **Metrics:** Prometheus (`server/config/metrics.ts`)
- **Logging:** Winston (`server/config/logger.ts`)
- **Tracing:** OpenTelemetry (`server/tracing.ts`)

**Endpoints:**
- `GET /metrics` - Prometheus metrics
- Logs written to `logs/api.log` (configurable)

**Source:** Observability configuration in respective config files.

## Component Interactions

### Request Flow

1. **Client Request** → Frontend (React)
2. **API Call** → Backend API Gateway (Express)
3. **Middleware Processing:**
   - Metrics collection
   - Request logging
   - Cache check (if GET)
4. **Route Handler** → Business logic
5. **Database/Cache** → Data operations
6. **Queue Job** → Background processing (if applicable)
7. **Response** → Client

**Source:** Request flow derived from middleware order and route handlers.

### Order Processing Flow

1. **Order Creation** → `POST /api/orders`
2. **Database Insert** → Orders and order_items tables
3. **Queue Job** → Order processing queue
4. **Worker Processing** → Order worker
5. **Email Notification** → Email worker
6. **Status Update** → Order status updated

**Source:** Order processing flow in `server/routes/orders.ts` and `server/workers/orderWorker.ts`.

## Data Flow

### Product Catalog Flow

1. **Request** → `GET /api/products`
2. **Cache Check** → Memory/Redis cache
3. **Cache Hit** → Return cached data
4. **Cache Miss** → Database query
5. **Cache Store** → Store in cache (300s TTL)
6. **Response** → Product list

**Source:** Product route with caching in `server/routes/products.ts` line 7.

### Payment Processing Flow

1. **Payment Request** → `POST /api/payments`
2. **Failure Simulation** → 10% random failure (training mode)
3. **Database Insert** → Payment record
4. **Order Update** → Order status to "processing" (if successful)
5. **Metrics** → Payment metrics incremented
6. **Response** → Payment result

**Source:** Payment processing in `server/routes/payments.ts` lines 66-126.

## Technology Stack

### Frontend Stack

- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icons

**Source:** Frontend dependencies in `package.json` lines 49-50, 74.

### Backend Stack

- **Express.js 4.18** - Web framework
- **Node.js 20+** - Runtime
- **TypeScript 5.5** - Type safety
- **Winston 3.11** - Logging
- **prom-client 15.1** - Metrics
- **@opentelemetry/sdk-node 0.51.0** - Tracing
- **Bull 4.16** - Job queue
- **ioredis 5.8** - Redis client
- **@supabase/supabase-js 2.57.4** - Supabase client

**Source:** Backend dependencies in `package.json` lines 30-52.

## Deployment Modes

### Single-VM Mode

All components on one virtual machine.

**Configuration:** `DEPLOYMENT_MODE=single-vm`

**Source:** Deployment mode in `server/config/deployment.ts` line 22.

### Multi-Tier Mode

Separate VMs for each tier.

**Configuration:** `DEPLOYMENT_MODE=multi-tier`

**Source:** Deployment mode in `server/config/deployment.ts` line 22.

### Kubernetes Mode

Full container orchestration.

**Configuration:** `DEPLOYMENT_MODE=kubernetes`

**Source:** Deployment mode in `server/config/deployment.ts` line 22. Kubernetes manifests in `deployment/kubernetes/`.

## Adapter Pattern

The platform uses an adapter pattern to support multiple infrastructure options:

- **Database Adapters:** Supabase, PostgreSQL, OCI Autonomous
- **Cache Adapters:** Memory, Redis
- **Worker Adapters:** In-process, Bull Queue, No-op
- **Secrets Adapters:** Environment variables, OCI Vault

**Source:** Adapter implementations in `server/adapters/` directory.

## Next Steps

- [Backend Architecture](02-backend-architecture.md) - Express.js backend details
- [Frontend Architecture](03-frontend-architecture.md) - React frontend details
- [Database Architecture](04-database-architecture.md) - Database schema and adapters
- [Cache Architecture](05-cache-architecture.md) - Caching strategy
- [Worker Architecture](06-worker-architecture.md) - Background job processing
- [Deployment Modes](07-deployment-modes.md) - Deployment configurations
- [Worker Reliability Model](08-worker-reliability-model.md) - Worker reliability semantics

