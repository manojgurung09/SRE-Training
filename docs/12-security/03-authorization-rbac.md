# Authorization & RBAC

Complete guide to Role-Based Access Control (RBAC).

## Overview

**Model:** Role-Based Access Control (RBAC)

**Roles:**
- `admin` - Full access
- `customer` - Limited access

**Implementation:** Database-level and application-level

**Source:** Role structure in `src/contexts/AuthContext.tsx` line 11.

## Roles

### Admin Role

**Permissions:**
- Full access to all resources
- Can manage users, products, orders
- Can update order statuses
- Access to admin panel

**Source:** Admin role permissions.

### Customer Role

**Permissions:**
- Access to own orders and payments
- Can view products
- Can create orders
- Limited to own resources

**Source:** Customer role permissions.

## Role Storage

### Database Storage

**Table:** `users`

**Column:** `role`

**Values:** `admin` | `customer`

**Source:** Role storage in user profile.

### Supabase Auth Storage

**Location:** `auth.users.raw_app_meta_data.role`

**Purpose:** Supabase Auth role metadata

**Source:** Supabase Auth role storage.

## Role Checking

### Frontend Role Check

**Function:** `isAdmin()`

**Location:** `src/contexts/AuthContext.tsx`

**Usage:**
```typescript
const { isAdmin } = useAuth();
if (isAdmin) {
  // Show admin features
}
```

**Source:** Admin check in `src/contexts/AuthContext.tsx` line 115.

### Backend Role Check

**Current Status:** Not implemented

**⚠️ Production Recommendation:** Implement role-based middleware

**Example:**
```typescript
function requireRole(role: string) {
  return (req, res, next) => {
    // Check user role from JWT
    // Allow or deny access
  };
}
```

**Source:** Backend role check recommendation.

## Authorization Patterns

### Resource Ownership

**Pattern:** Users can only access their own resources

**Example:**
- Customers can only view their own orders
- Customers can only view their own payments

**Source:** Resource ownership pattern.

### Admin Override

**Pattern:** Admins can access all resources

**Example:**
- Admins can view all orders
- Admins can manage all users

**Source:** Admin override pattern.

## Training vs Production

### Training Mode

**RBAC:** Relaxed for learning

**Features:**
- Development policies
- Simple role checks
- Learning-focused

**Use Case:** SRE training, learning RBAC concepts

### Production Mode

**RBAC:** Strict enforcement required

**Features:**
- Production policies
- Comprehensive role checks
- Audit logging

**⚠️ Production Warning:** Review and harden RBAC before production deployment

**Source:** RBAC mode differences.

## Next Steps

- [Security Overview](01-security-overview.md) - Security overview
- [Authentication Model](02-authentication-model.md) - Authentication details
- [RLS Policies](04-rls-policies.md) - Row Level Security

