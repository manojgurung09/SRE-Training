# Authentication Model

Complete authentication model documentation.

## Overview

**Frontend:** Supabase Auth (email/password)

**Backend:** Service role key for database operations

**Current Status:** Backend API routes do not require authentication tokens

**⚠️ Training Mode:** Authentication is relaxed for training purposes

**Source:** Authentication implementation in `src/contexts/AuthContext.tsx` and `server/config/supabase.ts`.

## Frontend Authentication

### Supabase Auth Client

**File:** `src/lib/supabase.ts`

**Configuration:**
- `VITE_SUPABASE_URL` - Project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key (public)

**Source:** Frontend client in `src/lib/supabase.ts` lines 1-10.

### Authentication Context

**File:** `src/contexts/AuthContext.tsx`

**Functions:**
- `signUp(email, password)` - User registration
- `signIn(email, password)` - User login
- `signOut()` - User logout
- `getUser()` - Get current user
- `isAdmin()` - Check admin role

**Source:** AuthContext in `src/contexts/AuthContext.tsx`.

### User Roles

**Roles:**
- `admin` - Full access
- `customer` - Limited access

**Storage:**
- `users.role` column in database
- `auth.users.raw_app_meta_data.role` in Supabase Auth

**Source:** Role structure in `src/contexts/AuthContext.tsx` line 11.

## Backend Authentication

### Service Role Client

**File:** `server/config/supabase.ts`

**Configuration:**
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (secret)

**Validation:** Service role key must be JWT format (starts with `eyJhbGciOi`)

**Source:** Backend client in `server/config/supabase.ts` lines 17-51. Validation in lines 28-33.

### API Authentication

**Current Status:** No authentication required on API routes

**⚠️ Training Mode:** Authentication relaxed for training

**Production Recommendation:** Implement JWT token validation middleware

**Source:** No authentication middleware in `server/app.ts`.

## JWT Tokens

### Token Structure

**Supabase Auth JWT:**
- `sub` - User ID
- `email` - User email
- `role` - Authentication role
- `app_metadata.role` - Application role (admin/customer)

**Source:** JWT structure inferred from Supabase Auth.

### Token Validation

**Frontend:** Automatic validation by Supabase client

**Backend:** Service role key provides full database access

**Source:** Token handling in Supabase clients.

## Authentication Flow

### Sign Up Flow

1. User submits email/password
2. Supabase Auth creates user
3. User profile created in `users` table
4. JWT token returned
5. User logged in

**Source:** Sign up flow in `src/contexts/AuthContext.tsx`.

### Sign In Flow

1. User submits email/password
2. Supabase Auth validates credentials
3. JWT token returned
4. User profile loaded
5. User logged in

**Source:** Sign in flow in `src/contexts/AuthContext.tsx`.

### Sign Out Flow

1. User clicks sign out
2. Supabase Auth session cleared
3. Local state cleared
4. User redirected

**Source:** Sign out flow in `src/contexts/AuthContext.tsx`.

## Training vs Production

### Training Mode

**Authentication:** Relaxed for learning

**Features:**
- No API authentication required
- Development RLS policies
- Simple setup

**Use Case:** SRE training, learning security concepts

### Production Mode

**Authentication:** Strict enforcement required

**Features:**
- API authentication required
- Production RLS policies
- JWT validation
- Rate limiting

**⚠️ Production Warning:** Review and harden authentication before production deployment

**Source:** Authentication mode differences.

## Next Steps

- [Security Overview](01-security-overview.md) - Security overview
- [Authorization & RBAC](03-authorization-rbac.md) - Role-based access control
- [RLS Policies](04-rls-policies.md) - Row Level Security

