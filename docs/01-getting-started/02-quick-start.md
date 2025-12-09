# Quick Start

Get BharatMart running locally in 5 minutes using the default Supabase configuration.

## Prerequisites Check

Before starting, ensure you have:

- **Node.js 20+** installed (`node --version`)
- **npm** installed (`npm --version`)
- **Git** installed
- **Supabase account** (free tier works)

## 5-Minute Setup

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd oci-multi-tier-web-app-ecommerce
npm install
```

### Step 2: Configure Environment

Copy the production environment template:

```bash
cp prd.env .env
```

Edit `.env` and set your Supabase credentials:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Also change:
 - FRONTEND_URL
 - CORS_ORIGIN

**Source:** Environment variables are loaded from `.env` file via `dotenv` in `server/index.ts` and `server/config/supabase.ts`.

### Step 3: Initialize Database

Run database migrations in order:

1. **Manual Destroy existing schema** (if needed):
   ```bash
   # Run: supabase/migrations/00000000000000_destroy-db.sql
   ```

2. **Manual Execute SQL setup**:
   ```bash
   # Run: supabase/migrations/00000000000001_exec_sql.sql
   ```

3. **Create base schema**:
   ```bash
   npm run db:init
   # Auto Executes: supabase/migrations/00000000000002_base_schema.sql
   ```

4. **Manual Seed data**:
   ```bash
   # Run: supabase/migrations/00000000000003_seed.sql
   ```

5. **Manual Set permissions**:
   ```bash
   # Run: supabase/migrations/00000000000004_set_permissions.sql
   ```

**Source:** Database initialization script is in `server/scripts/dbInit.ts`. Migration files are in `supabase/migrations/`.

### Step 4: Start Frontend

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend runs on: `http://localhost:5173`

**Source:** Frontend entry point is `src/main.tsx`. Vite dev server configured in `vite.config.ts`.

### Step 5: Start Backend

In a separate terminal:

```bash
npm run dev:server
```

Backend runs on: `http://localhost:3000`

**Source:** Backend entry point is `server/index.ts`. Server listens on port 3000 (configurable via `PORT` env var).

## Verify Installation

### Check Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "ok": true,
  "count": 0
}
```

**Source:** Health endpoint implementation in `server/routes/health.ts` line 8-41.

### Check Metrics Endpoint

```bash
curl http://localhost:3000/metrics
```

Should return Prometheus-formatted metrics.

**Source:** Metrics endpoint in `server/app.ts` line 39-42.

### Check Frontend

Open `http://localhost:5173` in your browser. You should see the BharatMart e-commerce interface.

## Default Configuration

The quick start uses these defaults (from `server/config/deployment.ts`):

- **Database:** `supabase` (via `DATABASE_TYPE` env var, defaults to `supabase`)
- **Cache:** `memory` (via `CACHE_TYPE` env var, defaults to `memory`)
- **Workers:** `in-process` (via `WORKER_MODE` env var, defaults to `in-process`)
- **Port:** `3000` (via `PORT` env var, defaults to `3000`)

**Source:** Default configuration in `server/config/deployment.ts` lines 21-28.

## Test Users

After seeding, you can log in with:

**Admin:**
- Email: `admin@bharatmart.com`
- Password: `admin123`

**Customer:**
- Email: `rajesh@example.com`
- Password: `customer123`

**Source:** Test users are seeded in `supabase/migrations/00000000000003_seed.sql`.

## Next Steps

- **Explore the API:** See [API Reference](../03-api-reference/01-api-overview.md)
- **Understand Architecture:** See [Architecture Overview](03-architecture-overview.md)
- **Configure for Production:** See [Configuration Guide](../04-configuration/)
- **Deploy:** See [Deployment Guides](../05-deployment/)

## Common First-Time Issues

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or use different port
PORT=3001 npm run dev:server
```

**Source:** Port conflict handling in `server/index.ts` lines 28-34.

### Database Connection Failed

**Error:** `Health check products query failed`

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Check Supabase project is active
3. Verify migrations ran successfully

**Source:** Health check implementation in `server/routes/health.ts` line 11-14.

### Missing Environment Variables

**Error:** `SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing`

**Solution:**
1. Ensure `.env` file exists
2. Verify all required variables are set
3. Check `.env` file is in project root

**Source:** Environment variable validation in `server/config/supabase.ts` lines 21-25.

## Training vs Production

**Training Mode (Default):**
- Chaos engineering enabled via `CHAOS_ENABLED=true`
- Payment failure simulation (10% rate)
- Relaxed error handling for learning

**Production Mode:**
- Set `CHAOS_ENABLED=false`
- Review security configuration
- Enable proper monitoring and alerting

**Source:** Chaos configuration in `server/middleware/metricsMiddleware.ts` lines 7-17. Payment failure simulation in `server/routes/payments.ts` line 74.

