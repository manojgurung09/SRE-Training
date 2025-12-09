# Database Adapters

Database adapter configuration and switching between adapters.

## Adapter Overview

**Pattern:** Adapter pattern for database abstraction

**Location:** `server/adapters/database/`

**Selection:** Via `DATABASE_TYPE` environment variable

**Source:** Database adapter selection in `server/adapters/database/index.ts` lines 30-43.

## Available Adapters

### Supabase Adapter

**File:** `server/adapters/database/supabase.ts`

**Default:** Yes (default adapter)

**Configuration:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

**Features:**
- Full CRUD operations
- Query builder interface
- Row Level Security (RLS) support
- Automatic connection management

**Source:** Supabase adapter implementation in `server/adapters/database/supabase.ts`.

### PostgreSQL Adapter

**File:** `server/adapters/database/postgresql.ts`

**Status:** Partially implemented (requires `pg` package)

**Configuration:**
- `POSTGRES_HOST` - Database host (default: localhost)
- `POSTGRES_PORT` - Database port (default: 5432)
- `POSTGRES_DB` - Database name (default: bharatmart)
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_SSL` - SSL mode (true/false)

**Connection String Format:**
```
postgresql://user:password@host:port/database?sslmode=require
```

**Source:** PostgreSQL adapter in `server/adapters/database/postgresql.ts` lines 6-15.

### OCI Autonomous Adapter

**File:** `server/adapters/database/oci-autonomous.ts`

**Purpose:** Oracle Cloud Infrastructure Autonomous Database

**Configuration:** OCI-specific connection parameters

**Source:** OCI adapter file exists in `server/adapters/database/` directory.

## Switching Adapters

### Switch to Supabase (Default)

```bash
DATABASE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

**Source:** Default configuration in `server/config/deployment.ts` line 25.

### Switch to PostgreSQL

```bash
DATABASE_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bharatmart
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_SSL=false
```

**Source:** PostgreSQL adapter configuration in `server/adapters/database/postgresql.ts` lines 7-12.

### Switch to OCI Autonomous

```bash
DATABASE_TYPE=oci-autonomous
# OCI-specific configuration
```

**Source:** OCI adapter selection in `server/adapters/database/index.ts` line 38.

## Adapter Interface

### IDatabaseAdapter Interface

```typescript
interface IDatabaseAdapter {
  query<T>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  insert<T>(table: string, data: Record<string, any>): Promise<QueryResult<T>>;
  update<T>(table: string, id: string, data: Record<string, any>): Promise<QueryResult<T>>;
  delete(table: string, id: string): Promise<QueryResult>;
  select<T>(table: string, options?: SelectOptions): Promise<QueryResult<T>>;
  initialize(): Promise<void>;
  close(): Promise<void>;
}
```

**Source:** Interface definition in `server/adapters/database/index.ts` lines 12-20.

## Connection Management

### Supabase Connection

**Type:** Managed connection pool (handled by Supabase)

**Configuration:** Automatic

**Source:** Supabase client manages connections automatically.

### PostgreSQL Connection

**Type:** Direct connection

**Configuration:** Connection string built from environment variables

**Source:** Connection string construction in `server/adapters/database/postgresql.ts` line 14.

## Adapter-Specific Configuration

### Supabase Configuration

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional:**
- Connection pooling (managed by Supabase)
- Read replicas (Supabase Pro tier)

**Source:** Supabase configuration in `server/config/supabase.ts`.

### PostgreSQL Configuration

**Required:**
- `POSTGRES_HOST`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

**Optional:**
- `POSTGRES_PORT` (default: 5432)
- `POSTGRES_SSL` (default: false)

**Source:** PostgreSQL configuration in `server/adapters/database/postgresql.ts` lines 7-12.

## Migration Between Adapters

### From Supabase to PostgreSQL

1. **Export Data:** Export data from Supabase
2. **Import Data:** Import to PostgreSQL
3. **Update Configuration:** Set `DATABASE_TYPE=postgresql`
4. **Update Connection:** Set PostgreSQL connection variables
5. **Restart Application:** Restart to use new adapter

**Source:** Migration process based on adapter selection logic.

### From PostgreSQL to Supabase

1. **Export Data:** Export from PostgreSQL
2. **Import Data:** Import to Supabase
3. **Update Configuration:** Set `DATABASE_TYPE=supabase`
4. **Update Credentials:** Set Supabase credentials
5. **Restart Application:** Restart to use new adapter

**Source:** Migration process based on adapter selection logic.

## Performance Considerations

### Supabase

**Advantages:**
- Managed connection pooling
- Automatic scaling
- Built-in RLS support

**Source:** Supabase provides managed database service.

### PostgreSQL

**Advantages:**
- Full control over connection pool
- Custom optimization
- Direct database access

**Source:** PostgreSQL provides direct database control.

## Training vs Production

### Training Mode

**Default:** Supabase (easiest setup)

**Use Case:** Learning, development

### Production Mode

**Options:**
- Supabase (managed, easy)
- PostgreSQL (self-hosted, full control)
- OCI Autonomous (enterprise, Oracle Cloud)

**Source:** Adapter selection based on deployment requirements.

## Next Steps

- [Environment Variables](01-environment-variables.md) - Complete environment variable reference
- [Cache Adapters](03-cache-adapters.md) - Cache adapter configuration
- [Worker Adapters](04-worker-adapters.md) - Worker adapter configuration

