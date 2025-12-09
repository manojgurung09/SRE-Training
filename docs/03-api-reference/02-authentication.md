# Authentication

Authentication mechanisms and security model.

## Current Authentication Model

### Frontend Authentication

The frontend uses **Supabase Auth** for user authentication.

**Implementation:**
- Authentication client: `src/lib/supabase.ts`
- Auth context: `src/contexts/AuthContext.tsx`
- Supabase client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Source:** Frontend authentication in `src/lib/supabase.ts` and `src/contexts/AuthContext.tsx`.

### Backend Authentication

**Current Status:** Backend API routes do not require authentication tokens.

**⚠️ Training Mode:** Authentication is relaxed for training purposes.

**Source:** No authentication middleware applied to routes in `server/app.ts`. Auth routes in `server/routes/auth.ts` return 410 (Gone) status.

### Database-Level Security

**Row Level Security (RLS):** All tables have RLS enabled.

**Service Role Access:** Backend uses Supabase service role key for full database access.

**Source:** RLS enabled in `supabase/migrations/00000000000002_base_schema.sql` lines 144-149. Service role policies in lines 152-177.

## Supabase Auth Integration

### Frontend Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Source:** Frontend client in `src/lib/supabase.ts` lines 1-10.

### Backend Client

```typescript
const supabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Source:** Backend client in `server/config/supabase.ts` lines 42-51.

### Environment Variables

**Frontend:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key (public)

**Backend:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (secret)

**Source:** Environment variable usage in `src/lib/supabase.ts` lines 3-4 and `server/config/supabase.ts` lines 17-18.

## JWT Token Structure

Supabase Auth uses JWT tokens with the following structure:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "role": "admin" // or "customer"
  }
}
```

**Source:** JWT structure inferred from Supabase Auth documentation and user profile structure in `src/contexts/AuthContext.tsx` lines 5-13.

## Role-Based Access Control (RBAC)

### Roles

- **admin** - Full access to all resources
- **customer** - Access to own resources only

### Role Storage

Roles are stored in:
- `users.role` column in database
- `auth.users.raw_app_meta_data.role` in Supabase Auth

**Source:** User profile structure in `src/contexts/AuthContext.tsx` line 11. Role check in line 115.

### Frontend Role Check

```typescript
const isAdmin = userProfile?.role === 'admin' && userProfile?.is_active === true;
```

**Source:** Admin check in `src/contexts/AuthContext.tsx` line 115.

## Session Management

### Frontend Session

- Sessions are managed by Supabase Auth client
- Session persistence handled automatically
- Session refresh handled automatically

**Source:** Session management in `src/contexts/AuthContext.tsx` lines 47-69.

### Backend Session

- Backend does not maintain sessions
- Each request is stateless
- Service role key provides full database access

**Source:** Backend client configuration in `server/config/supabase.ts` lines 46-49.

## Token Refresh

Supabase Auth automatically refreshes tokens when they expire.

**Source:** Auto-refresh configured in Supabase client (default behavior).

## Security Best Practices

### ⚠️ Production Recommendations

1. **Implement API Authentication:**
   - Add JWT verification middleware
   - Validate tokens on protected endpoints
   - Implement token refresh mechanism

2. **Secure Service Role Key:**
   - Never expose service role key to frontend
   - Store in secure secrets management
   - Rotate regularly

3. **Enable Rate Limiting:**
   - Implement rate limiting on authentication endpoints
   - Prevent brute force attacks

4. **Enable 2FA:**
   - Configure 2FA in Supabase Dashboard
   - Require 2FA for admin accounts

5. **Audit Logging:**
   - Log all authentication attempts
   - Monitor failed login attempts
   - Alert on suspicious activity

**Source:** Security recommendations based on current implementation gaps.

## Row Level Security (RLS)

All tables have RLS enabled with service role override:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ... etc
```

**Source:** RLS configuration in `supabase/migrations/00000000000002_base_schema.sql` lines 144-149.

## Legacy Authentication

**Status:** SQLite-based authentication has been removed.

**Endpoints:** All `/api/auth/*` endpoints return `410 Gone` status.

**Source:** Auth routes in `server/routes/auth.ts` return 410 status for all endpoints.

## Test Examples

**Source:** E2E test examples in `tests/e2e/06-users-profiles.test.ts`:

- User authentication tests
- Profile management tests
- Role-based access tests

