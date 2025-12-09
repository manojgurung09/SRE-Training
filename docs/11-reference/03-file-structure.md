# File Structure

Complete reference of the project file structure.

## Root Directory

```
oci-multi-tier-web-app-ecommerce/
├── config/                 # Configuration examples
├── deployment/             # Deployment configurations
├── docs/                   # Documentation
├── docs-archive/           # Archived documentation
├── server/                 # Backend code
├── src/                    # Frontend code
├── supabase/               # Database migrations
├── tests/                  # Test files
├── scripts/                # Utility scripts
├── package.json            # Dependencies and scripts
└── .env                    # Environment variables (not in repo)
```

**Source:** Project root structure.

## Server Directory

```
server/
├── adapters/               # Infrastructure adapters
│   ├── cache/             # Cache adapters
│   ├── database/          # Database adapters
│   ├── secrets/           # Secrets providers
│   └── workers/           # Worker adapters
├── config/                # Configuration files
│   ├── deployment.ts      # Deployment configuration
│   ├── logger.ts          # Logger configuration
│   ├── metrics.ts         # Metrics definitions
│   ├── queue.ts           # Queue configuration
│   ├── redis.ts           # Redis configuration
│   └── supabase.ts        # Supabase configuration
├── middleware/            # Express middleware
│   ├── auth.ts           # Authentication middleware
│   ├── cache.ts          # Cache middleware
│   ├── errorHandler.ts   # Error handling
│   ├── logger.ts         # Request logging
│   └── metricsMiddleware.ts # Metrics and chaos
├── routes/               # API routes
│   ├── auth.ts          # Auth routes (deprecated)
│   ├── health.ts        # Health endpoints
│   ├── orders.ts        # Orders API
│   ├── payments.ts      # Payments API
│   ├── products.ts      # Products API
│   └── queues.ts        # Queue stats
├── workers/              # Background workers
│   ├── emailWorker.ts   # Email worker
│   ├── orderWorker.ts   # Order worker
│   ├── paymentWorker.ts # Payment worker
│   └── index.ts         # Worker entry point
├── app.ts               # Express application
├── index.ts             # Server entry point
└── tracing.ts           # OpenTelemetry setup
```

**Source:** Server directory structure.

## Source Directory

```
src/
├── components/           # React components
│   ├── admin/           # Admin components
│   ├── AdminPanel.tsx   # Admin panel
│   ├── AuthModal.tsx    # Authentication modal
│   ├── Checkout.tsx     # Checkout component
│   ├── OrderManagement.tsx # Order management
│   ├── OrderTracking.tsx # Order tracking
│   ├── ProductCatalog.tsx # Product catalog
│   ├── ShoppingCart.tsx # Shopping cart
│   └── UserProfile.tsx  # User profile
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication context
│   └── CartContext.tsx  # Shopping cart context
├── lib/                 # Utility libraries
│   └── supabase.ts      # Supabase client
├── App.tsx              # Main application
└── main.tsx             # Frontend entry point
```

**Source:** Source directory structure.

## Tests Directory

```
tests/
├── e2e/                 # E2E test files
│   ├── 01-system-health.test.ts
│   ├── 02-database-redis.test.ts
│   ├── 03-products-crud.test.ts
│   ├── 04-orders-crud.test.ts
│   ├── 05-payments-crud.test.ts
│   ├── 06-users-profiles.test.ts
│   ├── 07-observability.test.ts
│   ├── 08-chaos-engineering.test.ts
│   └── 09-data-integrity.test.ts
├── helpers/             # Test helpers
│   ├── cleanup.ts       # Cleanup functions
│   └── test-data.ts     # Test data generation
└── setup.ts             # Test setup
```

**Source:** Tests directory structure.

## Deployment Directory

```
deployment/
├── kubernetes/          # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── configmap.yaml
│   ├── ingress.yaml
│   ├── namespace.yaml
│   ├── redis-cache.yaml
│   ├── redis-queue.yaml
│   ├── secrets.yaml.example
│   └── workers-deployment.yaml
├── docker-compose.yml   # Docker Compose config
├── Dockerfile.backend   # Backend Dockerfile
├── Dockerfile.frontend  # Frontend Dockerfile
├── Dockerfile.workers   # Workers Dockerfile
├── nginx.conf           # Nginx configuration
├── prometheus.yml       # Prometheus configuration
└── scripts/             # Deployment scripts
```

**Source:** Deployment directory structure.

## Supabase Directory

```
supabase/
└── migrations/          # Database migrations
    ├── 00000000000002_base_schema.sql
    └── 00000000000004_set_permissions.sql
```

**Source:** Supabase directory structure.

## Configuration Files

### Root Level

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `jest.config.ts` - Jest configuration
- `vite.config.ts` - Vite configuration
- `.env` - Environment variables (not in repo)

**Source:** Root configuration files.

## Next Steps

- [Glossary](01-glossary.md) - Term definitions
- [Acronyms](02-acronyms.md) - Acronym reference
- [Code Organization](04-code-organization.md) - Code organization

