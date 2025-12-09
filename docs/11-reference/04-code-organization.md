# Code Organization

Complete guide to code organization and architecture patterns.

## Architecture Patterns

### Adapter Pattern

**Purpose:** Enable interchangeable infrastructure implementations

**Location:** `server/adapters/`

**Adapters:**
- Database: Supabase, PostgreSQL, OCI Autonomous
- Cache: Memory, Redis
- Workers: In-process, Bull Queue, No-op
- Secrets: Environment variables, OCI Vault

**Source:** Adapter implementations in `server/adapters/` directory.

### Middleware Pattern

**Purpose:** Request processing pipeline

**Location:** `server/middleware/`

**Middleware Order:**
1. CORS
2. Body parsers
3. Metrics
4. Logging
5. Routes
6. Error handlers

**Source:** Middleware order in `server/app.ts` lines 22-73.

### Route Pattern

**Purpose:** Organize API endpoints by resource

**Location:** `server/routes/`

**Routes:**
- `/api/auth` - Authentication
- `/api/health` - Health checks
- `/api/products` - Products
- `/api/orders` - Orders
- `/api/payments` - Payments

**Source:** Route registration in `server/app.ts` lines 44-48.

## Code Structure

### Backend Structure

**Entry Point:** `server/index.ts`
- Loads environment
- Initializes logger
- Starts Express server

**Application:** `server/app.ts`
- Express app setup
- Middleware configuration
- Route registration

**Configuration:** `server/config/`
- Centralized configuration
- Environment-based settings
- Adapter selection

**Source:** Backend structure.

### Frontend Structure

**Entry Point:** `src/main.tsx`
- React app initialization
- Context providers
- App rendering

**Application:** `src/App.tsx`
- Main component
- Navigation
- View routing

**Components:** `src/components/`
- Reusable UI components
- Feature components
- Admin components

**Source:** Frontend structure.

## Naming Conventions

### Files

**Backend:**
- Routes: `*.ts` (e.g., `products.ts`)
- Middleware: `*.ts` (e.g., `cache.ts`)
- Config: `*.ts` (e.g., `metrics.ts`)

**Frontend:**
- Components: `*.tsx` (e.g., `ProductCatalog.tsx`)
- Contexts: `*.tsx` (e.g., `AuthContext.tsx`)
- Utilities: `*.ts` (e.g., `supabase.ts`)

**Source:** File naming conventions.

### Functions

**Naming:**
- camelCase for functions
- PascalCase for components/classes
- UPPER_CASE for constants

**Source:** Function naming conventions.

## Module Organization

### Separation of Concerns

**Layers:**
- Routes: Request handling
- Middleware: Cross-cutting concerns
- Config: Configuration
- Adapters: Infrastructure abstraction
- Workers: Background processing

**Source:** Module organization.

### Dependency Flow

```
Routes → Middleware → Config → Adapters → External Services
```

**Source:** Dependency flow.

## Best Practices

### Code Organization

1. **Single Responsibility:** Each module has one purpose
2. **Separation of Concerns:** Clear boundaries between layers
3. **DRY Principle:** Don't repeat yourself
4. **Configuration:** Centralize configuration

**Source:** Code organization best practices.

## Next Steps

- [Glossary](01-glossary.md) - Term definitions
- [Acronyms](02-acronyms.md) - Acronym reference
- [File Structure](03-file-structure.md) - Project structure

