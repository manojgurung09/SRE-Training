# RLS Policies

Complete guide to Row Level Security (RLS) policies.

## Overview

**Status:** RLS enabled on all tables

**Tables:**
- `users`
- `products`
- `orders`
- `order_items`
- `payments`
- `inventory_logs`

**Source:** RLS configuration in `supabase/migrations/00000000000002_base_schema.sql` lines 144-149.

## RLS Configuration

### Enablement

**Migration:** `00000000000002_base_schema.sql`

**Code:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
```

**Source:** RLS enablement in `supabase/migrations/00000000000002_base_schema.sql` lines 144-149.

### Policy Configuration

**Migration:** `00000000000004_set_permissions.sql`

**Source:** RLS policies in `supabase/migrations/00000000000004_set_permissions.sql`.

## Development Policies

### Products Table

**Policy:** `products_public_read`

**Access:** Public read (anon and authenticated)

**Source:** Products policy in `supabase/migrations/00000000000004_set_permissions.sql` lines 22-30.

### Users Table

**Policy:** `users_all_dev`

**Access:** Full access for authenticated users

**⚠️ Training Mode:** Development policy (relaxed)

**Source:** Users policy in `supabase/migrations/00000000000004_set_permissions.sql` lines 34-46.

### Orders Table

**Policy:** `orders_all_dev`

**Access:** Full access for authenticated users

**⚠️ Training Mode:** Development policy (relaxed)

**Source:** Orders policy in `supabase/migrations/00000000000004_set_permissions.sql` lines 48-62.

### Order Items Table

**Policy:** `order_items_all_dev`

**Access:** Full access for authenticated users

**⚠️ Training Mode:** Development policy (relaxed)

**Source:** Order items policy in `supabase/migrations/00000000000004_set_permissions.sql` lines 64-78.

### Payments Table

**Policy:** `payments_all_dev`

**Access:** Full access for authenticated users

**⚠️ Training Mode:** Development policy (relaxed)

**Source:** Payments policy in `supabase/migrations/00000000000004_set_permissions.sql` lines 80-94.

### Inventory Logs Table

**Policy:** `inventory_logs_read`

**Access:** Read-only for authenticated users

**Source:** Inventory logs policy in `supabase/migrations/00000000000004_set_permissions.sql` lines 96-109.

## Service Role Access

### Backend Access

**Role:** `service_role`

**Access:** Full access via service role key

**Purpose:** Backend operations bypass RLS

**Source:** Service role access in `server/config/supabase.ts`.

### Function Access

**Function:** `exec_sql`

**Access:** Service role only

**Purpose:** Backend SQL execution

**Source:** Function access in `supabase/migrations/00000000000004_set_permissions.sql` lines 5-16.

## Production Policies

### Recommended Policies

**Products:**
- Public read access
- Admin write access

**Users:**
- Users can read/update own profile
- Admins can manage all users

**Orders:**
- Users can read/create own orders
- Admins can manage all orders

**Payments:**
- Users can read own payments
- Admins can manage all payments

**⚠️ Production Note:** Review and restrict development policies for production use

**Source:** Production policy recommendations.

## Training vs Production

### Training Mode

**Policies:** Development policies (relaxed)

**Use Case:** Learning, development, SRE training

### Production Mode

**Policies:** Production policies (restricted)

**Use Case:** Production deployments

**⚠️ Production Warning:** Review and harden RLS policies before production deployment

**Source:** RLS policy mode differences.

## Next Steps

- [Security Overview](01-security-overview.md) - Security overview
- [Authorization & RBAC](03-authorization-rbac.md) - Role-based access control
- [Secrets Management](05-secrets-management.md) - Secrets handling

