# Secrets Management

Secrets provider configuration and secure secret handling.

## Overview

**Pattern:** Adapter pattern for secrets abstraction

**Location:** `server/adapters/secrets/`

**Selection:** Via `SECRETS_PROVIDER` environment variable

**Source:** Secrets provider selection in `server/adapters/secrets/index.ts` lines 10-20.

## Available Providers

### Environment Variables Provider

**File:** `server/adapters/secrets/env.ts`

**Default:** Yes (default provider)

**Behavior:**
- Reads secrets from environment variables
- No encryption at rest
- Simple setup

**Source:** Environment secrets provider in `server/adapters/secrets/env.ts`.

### OCI Vault Provider

**File:** `server/adapters/secrets/oci-vault.ts`

**Configuration:**
- `SECRETS_PROVIDER=oci-vault`
- OCI Vault endpoint configuration

**Behavior:**
- Retrieves secrets from OCI Vault
- Encrypted at rest
- Secure secret management

**Source:** OCI Vault provider in `server/adapters/secrets/oci-vault.ts`.

## Switching Providers

### Switch to Environment Variables (Default)

```bash
SECRETS_PROVIDER=env
```

**Source:** Default configuration in `server/config/deployment.ts` line 23.

### Switch to OCI Vault

```bash
SECRETS_PROVIDER=oci-vault
# OCI Vault configuration required
```

**Source:** OCI Vault provider selection in `server/adapters/secrets/index.ts` line 12.

## Secrets Interface

### ISecretsProvider Interface

```typescript
interface ISecretsProvider {
  getSecret(name: string): Promise<string | null>;
  getAllSecrets(): Promise<Record<string, string>>;
}
```

**Source:** Interface definition in `server/adapters/secrets/index.ts` lines 5-8.

## Required Secrets

### Database Secrets

**SUPABASE_SERVICE_ROLE_KEY:**
- Type: JWT string
- Purpose: Backend database access
- Validation: Must start with `eyJhbGciOi` (JWT format)

**Source:** Service role key validation in `server/config/supabase.ts` lines 28-33.

### Frontend Secrets

**VITE_SUPABASE_ANON_KEY:**
- Type: String
- Purpose: Frontend Supabase access
- Note: Public key (safe to expose in frontend)

**Source:** Frontend Supabase key in `src/lib/supabase.ts` line 4.

### Cache Secrets

**CACHE_REDIS_URL:**
- Type: Connection string
- Purpose: Redis cache connection
- Format: `redis://user:password@host:port`

**Source:** Redis URL in `server/adapters/cache/redis.ts` line 9.

### Queue Secrets

**QUEUE_REDIS_URL:**
- Type: Connection string
- Purpose: Redis queue connection
- Format: `redis://user:password@host:port`

**Source:** Queue Redis URL in `server/config/queue.ts` line 4.

## Secret Storage

### Environment Variables

**Location:** `.env` file (root directory)

**Format:**
```bash
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
CACHE_REDIS_URL=redis://localhost:6379
```

**⚠️ Security Warning:** Never commit `.env` files to version control

**Source:** Environment variable usage throughout configuration files.

### OCI Vault

**Location:** Oracle Cloud Infrastructure Vault

**Format:** Managed by OCI Vault service

**Source:** OCI Vault provider implementation.

## Secret Rotation

### Current Status

**Not Implemented:** No automatic secret rotation

**⚠️ Production Recommendation:** Implement secret rotation policy

**Source:** No secret rotation implementation found.

### Manual Rotation

1. **Update Secret:** Update secret in provider
2. **Restart Application:** Restart to load new secret
3. **Verify:** Verify application works with new secret

**Source:** Manual rotation process.

## Security Best Practices

### Environment Variables

1. **Never Commit Secrets:**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Use Strong Secrets:**
   - Long, random strings
   - Unique per environment

3. **Limit Access:**
   - Restrict file permissions
   - Use secrets management service in production

**Source:** Security best practices.

### OCI Vault

1. **Use Vault Policies:**
   - Restrict access to specific secrets
   - Use IAM policies

2. **Enable Audit Logging:**
   - Track secret access
   - Monitor for suspicious activity

3. **Rotate Secrets Regularly:**
   - Set rotation schedule
   - Automate rotation where possible

**Source:** OCI Vault best practices.

## Training vs Production

### Training Mode

**Default:** Environment variables (simple setup)

**Use Case:** Learning, development

### Production Mode

**Recommended:** OCI Vault or similar secrets management service

**Use Case:** Production deployments, security compliance

**Source:** Secrets provider selection via `SECRETS_PROVIDER` environment variable.

## Next Steps

- [Environment Variables](01-environment-variables.md) - Complete environment variable reference
- [Deployment Configuration](06-deployment-configuration.md) - Deployment mode configuration
- [Security: Secrets Management](../12-security/05-secrets-management.md) - Security aspects

