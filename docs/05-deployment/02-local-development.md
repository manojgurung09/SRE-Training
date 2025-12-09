# Local Development

Complete guide for local development setup and running the application.

## Prerequisites

### Required Software

- **Node.js 20+** - JavaScript runtime
- **npm** - Package manager
- **Git** - Version control
- **Supabase Account** - Database and authentication

**Source:** Prerequisites based on `package.json` and project requirements.

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
```

**Source:** Standard Git workflow.

### 2. Install Dependencies

```bash
npm install
```

**Source:** Installation command in `package.json`.

### 3. Configure Environment

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
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Source:** Environment variables in `server/config/supabase.ts` and `src/lib/supabase.ts`.

### 4. Initialize Database

```bash
npm run db:init
```

**Source:** Database initialization script in `package.json` line 8.

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

**Source:** Development scripts in `package.json` lines 7, 10.

## Development Scripts

### Backend Development

**Command:** `npm run dev:server`

**Actions:**
- Initialize database
- Start Express server with hot reload
- Watch for file changes

**Source:** Development server script in `package.json` line 10.

### Frontend Development

**Command:** `npm run dev`

**Actions:**
- Start Vite dev server
- Hot module replacement
- Development build

**Source:** Frontend development script in `package.json` line 7.

### Worker Development

**Command:** `npm run dev:worker`

**Actions:**
- Start worker process with hot reload
- Watch for file changes

**Source:** Worker development script in `package.json` line 11.

## Docker Compose Development

### Start All Services

```bash
cd deployment
docker-compose up
```

**Services Started:**
- Frontend (port 80)
- Backend (port 3000)
- Cache (Redis, port 6379)
- Queue (Redis, port 6380)
- Workers (email, orders)
- Prometheus (port 9091)
- Grafana (port 3001)

**Source:** Docker Compose configuration in `deployment/docker-compose.yml`.

### Stop All Services

```bash
docker-compose down
```

**Source:** Docker Compose commands.

## Database Setup

### Supabase Setup

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Note project URL and keys

2. **Run Migrations:**
   - Migrations in `supabase/migrations/`
   - Apply via Supabase Dashboard or CLI

**Source:** Supabase setup process.

### Database Initialization

**Command:** `npm run db:init`

**Actions:**
- Initialize database schema
- Create required tables
- Set up RLS policies

**Source:** Database initialization script in `package.json` line 8.

### Database Reset

**Command:** `npm run db:reset`

**Actions:**
- Reset database schema
- Recreate tables
- Reapply RLS policies

**Source:** Database reset script in `package.json` line 9.

## Testing

### Run All Tests

```bash
npm test
```

**Source:** Test script in `package.json` line 23.

### Run E2E Tests

```bash
npm run test:e2e
```

**Source:** E2E test script in `package.json` line 26.

### Run SRE Validation

```bash
npm run test:sre
```

**Source:** SRE validation script in `package.json` line 27.

## Development Tools

### Type Checking

**Command:** `npm run typecheck`

**Actions:**
- TypeScript type checking
- No emit (validation only)

**Source:** Type check script in `package.json` line 22.

### Linting

**Command:** `npm run lint`

**Actions:**
- ESLint code analysis
- Code style validation

**Source:** Lint script in `package.json` line 20.

## Access Points

### Frontend

**URL:** http://localhost:5173

**Features:**
- Product catalog
- Shopping cart
- Order management
- User authentication
- Admin panel

**Source:** Vite dev server default port.

### Backend API

**URL:** http://localhost:3000

**Endpoints:**
- `/api/health` - Health check
- `/api/products` - Products API
- `/api/orders` - Orders API
- `/api/payments` - Payments API
- `/metrics` - Prometheus metrics

**Source:** Backend server port in `server/index.ts` line 10.

### Prometheus (Docker Compose)

**URL:** http://localhost:9091

**Source:** Prometheus port in `deployment/docker-compose.yml` line 108.

### Grafana (Docker Compose)

**URL:** http://localhost:3001

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Source:** Grafana configuration in `deployment/docker-compose.yml` lines 120-132.

## Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
- Change `PORT` in `.env`
- Or stop process using the port

**Source:** Port configuration in `server/index.ts` line 10.

### Database Connection Issues

**Error:** Database connection failures

**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project status
- Verify network connectivity

**Source:** Database configuration in `server/config/supabase.ts`.

### Redis Connection Issues

**Error:** Redis connection failures

**Solution:**
- Verify Redis is running
- Check `CACHE_REDIS_URL` or `QUEUE_REDIS_URL`
- Verify Redis port accessibility

**Source:** Redis configuration in `server/config/redis.ts`.

## Next Steps

- [Deployment Overview](01-deployment-overview.md) - Deployment options
- [Single-VM Deployment](03-single-vm-deployment.md) - Single-VM setup
- [Docker Deployment](06-docker-deployment.md) - Docker setup

