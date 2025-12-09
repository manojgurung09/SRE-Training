# Security Overview

Complete security model, authentication, authorization, and security best practices.

## Security Model

### Authentication

**Frontend:** Supabase Auth (email/password)

**Backend:** Service role key for database operations

**Current Status:** Backend API routes do not require authentication tokens

**⚠️ Training Mode:** Authentication is relaxed for training purposes

**Source:** Authentication implementation in `src/contexts/AuthContext.tsx` and `server/config/supabase.ts`.

### Authorization

**Role-Based Access Control (RBAC):**
- `admin` - Full access
- `customer` - Access to own resources

**Database-Level:** Row Level Security (RLS) enabled on all tables

**Source:** Role structure in `src/contexts/AuthContext.tsx` line 11. RLS in `supabase/migrations/00000000000002_base_schema.sql` lines 144-149.

## Supabase Auth Model

### Frontend Authentication

**Client:** Supabase JavaScript client

**Configuration:**
- `VITE_SUPABASE_URL` - Project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key (public)

**Source:** Frontend client in `src/lib/supabase.ts` lines 1-10.

### Backend Authentication

**Client:** Supabase service role client

**Configuration:**
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (secret)

**Validation:** Service role key must be JWT format (starts with `eyJhbGciOi`)

**Source:** Backend client in `server/config/supabase.ts` lines 17-51. Validation in lines 28-33.

## JWT Token Handling

### Token Structure

Supabase Auth uses JWT tokens with:
- `sub` - User ID
- `email` - User email
- `role` - Authentication role
- `app_metadata.role` - Application role (admin/customer)

**Source:** JWT structure inferred from Supabase Auth and user profile.

### Token Validation

**Frontend:** Automatic token validation by Supabase client

**Backend:** Service role key provides full database access

**Source:** Token handling in Supabase clients.

## Role-Based Access Control (RBAC)

### Roles

**Admin:**
- Full access to all resources
- Can manage users, products, orders
- Can update order statuses

**Customer:**
- Access to own orders and payments
- Can view products
- Can create orders

**Source:** Role definitions in `src/contexts/AuthContext.tsx` line 115.

### Role Storage

**Location:**
- `users.role` column in database
- `auth.users.raw_app_meta_data.role` in Supabase Auth

**Source:** Role storage in user profile structure.

## Row Level Security (RLS)

### RLS Status

**Enabled:** All tables have RLS enabled

**Tables:**
- `users`
- `products`
- `orders`
- `order_items`
- `payments`
- `inventory_logs`

**Source:** RLS configuration in `supabase/migrations/00000000000002_base_schema.sql` lines 144-149.

### RLS Policies

**Service Role:** Full access via service role policies

**Authenticated Users:** Access based on user policies

**Anonymous Users:** Limited access (products read-only)

**Source:** RLS policies in `supabase/migrations/00000000000004_set_permissions.sql`.

### Development Policies

**⚠️ Training Mode:** Development policies allow full access for authenticated users

**Production Note:** Restrict policies for production use

**Source:** Development policies in `supabase/migrations/00000000000004_set_permissions.sql` lines 34-94.

## Secrets Management

### Current Implementation

**Provider:** Environment variables (`.env` file)

**Source:** Secrets provider in `server/config/deployment.ts` line 23.

### Supported Providers

**Environment Variables:**
- Default provider
- Secrets stored in `.env` file

**OCI Vault:**
- Oracle Cloud Infrastructure Vault
- Configure via `SECRETS_PROVIDER=oci-vault`

**Source:** Secrets provider selection in `server/adapters/secrets/index.ts` lines 10-20.

### Secrets Storage

**Required Secrets:**
- `SUPABASE_SERVICE_ROLE_KEY` - Database access
- `VITE_SUPABASE_ANON_KEY` - Frontend access (public)
- `REDIS_URL` - Redis connection (if using Redis)
- `QUEUE_REDIS_URL` - Queue connection (if using Bull Queue)

**Source:** Secrets usage throughout configuration files.

## Network-Level Security

### CORS Configuration

**Allowed Origins:**
- `FRONTEND_URL` environment variable
- `http://localhost:5173` (default Vite dev server)
- `http://40.81.230.114:5173`
- `http://localhost:3000`
- `http://40.81.230.114:3000`

**Credentials:** Enabled

**Source:** CORS configuration in `server/app.ts` lines 22-31.

### HTTPS

**Current:** No HTTPS enforcement in code

**⚠️ Production Note:** Use HTTPS in production (configure at load balancer/ingress level)

**Source:** HTTPS should be configured at infrastructure level.

## API Security

### Authentication

**Current Status:** No authentication required on API routes

**⚠️ Training Mode:** Authentication relaxed for training

**Production Recommendation:** Implement JWT token validation middleware

**Source:** No authentication middleware in `server/app.ts`.

### Rate Limiting

**Current Status:** Not implemented

**⚠️ Production Recommendation:** Implement rate limiting to prevent abuse

**Source:** No rate limiting middleware found.

### Input Validation

**Current:** Basic validation in route handlers

**Examples:**
- Required field checks
- Type validation
- Status value validation

**Source:** Input validation in route handlers (e.g., `server/routes/products.ts` lines 69-71).

## Data Security

### Encryption at Rest

**Database:** Managed by Supabase (PostgreSQL encryption)

**Source:** Supabase provides encryption at rest.

### Encryption in Transit

**HTTPS:** Should be configured at infrastructure level

**Database:** Supabase uses TLS for database connections

**Source:** Encryption in transit handled by infrastructure.

### SQL Injection Protection

**Method:** Parameterized queries via Supabase client

**Source:** Supabase client uses parameterized queries automatically.

## Security Best Practices

### Production Recommendations

1. **Enable API Authentication:**
   - Add JWT verification middleware
   - Validate tokens on protected endpoints

2. **Implement Rate Limiting:**
   - Prevent brute force attacks
   - Limit API request rates

3. **Use HTTPS:**
   - Configure TLS at load balancer/ingress
   - Enforce HTTPS redirects

4. **Secure Secrets:**
   - Use secrets management service (OCI Vault, AWS Secrets Manager)
   - Rotate secrets regularly
   - Never commit secrets to version control

5. **Restrict RLS Policies:**
   - Review and restrict development policies
   - Implement proper user-based access control

6. **Enable 2FA:**
   - Configure 2FA in Supabase Dashboard
   - Require 2FA for admin accounts

7. **Audit Logging:**
   - Log all authentication attempts
   - Monitor failed login attempts
   - Alert on suspicious activity

**Source:** Recommendations based on current implementation gaps.

## Training vs Production

### Training Mode

**Security:** Relaxed for learning purposes

**Features:**
- No API authentication required
- Development RLS policies
- Payment failure simulation (10% rate)

**Use Case:** SRE training, learning security concepts

**Source:** Training mode characteristics from code analysis.

### Production Mode

**Security:** Strict enforcement required

**Features:**
- API authentication required
- Production RLS policies
- Real payment gateway integration
- Rate limiting
- HTTPS enforcement

**⚠️ Production Warning:** Review and harden security before production deployment

**Source:** Production requirements based on security best practices.

## Security Checklist

### Pre-Production

- [ ] Enable API authentication
- [ ] Implement rate limiting
- [ ] Configure HTTPS
- [ ] Review RLS policies
- [ ] Secure secrets management
- [ ] Enable 2FA for admin accounts
- [ ] Configure audit logging
- [ ] Review and restrict CORS origins
- [ ] Remove payment failure simulation
- [ ] Disable chaos engineering

**Source:** Checklist based on security analysis.

## Next Steps

- [Authentication Model](02-authentication-model.md) - Detailed authentication documentation
- [Authorization & RBAC](03-authorization-rbac.md) - Role-based access control
- [RLS Policies](04-rls-policies.md) - Row Level Security configuration
- [Secrets Management](05-secrets-management.md) - Secrets provider setup
- [Network Security](06-network-security.md) - CORS, HTTPS, firewall configuration

