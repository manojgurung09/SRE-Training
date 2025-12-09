# System Info API

Comprehensive system information endpoint for diagnostics, monitoring, and troubleshooting.

## Endpoint

```
GET /api/system/info
```

**Source:** Route handler in `server/routes/system.ts` lines 16-28.

## Purpose

Returns comprehensive system information including:
- Application details (name, version, uptime, environment)
- Deployment configuration (mode, host, port, region)
- Feature flags status (metrics, logging, tracing, chaos engineering)
- Service health status (database, cache, workers)
- Service configurations
- Observability configuration
- Available endpoints

## Response Format

**Status:** `200 OK`

**Body:** Comprehensive JSON object with system information

```json
{
  "application": {
    "name": "BharatMart API",
    "version": "1.0.0",
    "environment": "development",
    "nodeVersion": "v20.x.x",
    "uptime": 3600,
    "startTime": "2024-12-19T10:00:00.000Z",
    "timestamp": "2024-12-19T11:00:00.000Z"
  },
  "deployment": {
    "mode": "single-vm",
    "host": "0.0.0.0",
    "port": 3000,
    "region": "ap-mumbai-1",
    "compartment": "ocid1.compartment...."
  },
  "features": {
    "metrics": {
      "enabled": true,
      "endpoint": "/metrics",
      "port": 3000
    },
    "logging": {
      "enabled": true,
      "level": "info",
      "format": "json",
      "file": "./logs/api.log"
    },
    "tracing": {
      "enabled": true,
      "serviceName": "bharatmart-backend",
      "exporterEndpoint": "http://localhost:4318/v1/traces",
      "sampler": "always_on"
    },
    "chaosEngineering": {
      "enabled": true,
      "latencyMs": 800,
      "randomFailures": false
    }
  },
  "services": {
    "database": {
      "type": "supabase",
      "status": "healthy",
      "connected": true,
      "uptime": 3600,
      "config": {
        "provider": "supabase",
        "url": "https://project.supabase.co",
        "poolMin": 5,
        "poolMax": 20
      },
      "healthCheck": {
        "lastCheck": "2024-12-19T11:00:00.000Z",
        "responseTimeMs": 45,
        "error": null
      }
    },
    "cache": {
      "type": "memory",
      "status": "healthy",
      "enabled": true,
      "uptime": 3600,
      "config": {
        "type": "memory",
        "ttl": 300,
        "prefix": "bharatmart:cache"
      }
    },
    "workers": {
      "mode": "none",
      "status": "disabled",
      "enabled": false,
      "uptime": null,
      "config": {
        "mode": "none",
        "concurrency": 5,
        "queueUrl": null
      },
      "workers": {
        "email": {
          "status": "disabled",
          "uptime": null
        },
        "order": {
          "status": "disabled",
          "uptime": null
        },
        "payment": {
          "status": "disabled",
          "uptime": null
        }
      }
    }
  },
  "configuration": {
    "deploymentMode": "single-vm",
    "databaseType": "supabase",
    "cacheType": "memory",
    "workerMode": "none",
    "secretsProvider": "env",
    "configProvider": "env",
    "authProvider": "supabase"
  },
  "security": {
    "secretsProvider": "env",
    "vaultConfigured": false,
    "httpsEnabled": false
  },
  "observability": {
    "metricsEnabled": true,
    "logsEnabled": true,
    "tracingEnabled": true,
    "logIngestion": {
      "configured": false,
      "service": null,
      "logGroup": null
    },
    "metricsIngestion": {
      "configured": false,
      "service": null,
      "namespace": null
    }
  },
  "endpoints": {
    "health": "/api/health",
    "readiness": "/api/health/ready",
    "metrics": "/metrics",
    "info": "/api/system/info"
  }
}
```

**Source:** Response structure in `server/routes/system.ts` lines 30-130.

## Response Fields

### Application Information

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Application name |
| `version` | string | Application version |
| `environment` | string | Node environment (development/production) |
| `nodeVersion` | string | Node.js version |
| `uptime` | number | Application uptime in seconds |
| `startTime` | string | ISO timestamp of application start |
| `timestamp` | string | ISO timestamp of response |

### Deployment Information

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string | Deployment mode (single-vm/multi-tier/kubernetes) |
| `host` | string | Server host binding |
| `port` | number | Server port |
| `region` | string\|null | OCI region (if configured) |
| `compartment` | string\|null | OCI compartment ID (masked) |

### Features Status

Shows which features are enabled/disabled:

- **Metrics:** Prometheus metrics configuration
- **Logging:** Winston logging configuration
- **Tracing:** OpenTelemetry tracing configuration
- **Chaos Engineering:** Chaos engineering settings

### Services Health

Health status and configuration for each service:

#### Database

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Database type (supabase/postgresql/oci-autonomous) |
| `status` | string | Health status (healthy/unhealthy) |
| `connected` | boolean | Connection status |
| `uptime` | number\|null | Service uptime in seconds |
| `config` | object | Database configuration (URL masked, pool settings) |
| `healthCheck` | object | Last health check results |

#### Cache

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Cache type (memory/redis/oci-cache) |
| `status` | string | Health status |
| `enabled` | boolean | Whether cache is enabled |
| `uptime` | number\|null | Service uptime in seconds |
| `config` | object | Cache configuration (URL masked, TTL, prefix) |

#### Workers

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string | Worker mode (in-process/bull-queue/none) |
| `status` | string | Overall worker status |
| `enabled` | boolean | Whether workers are enabled |
| `uptime` | number\|null | Service uptime in seconds |
| `config` | object | Worker configuration |
| `workers` | object | Individual worker status (email, order, payment) |

### Configuration Summary

High-level configuration summary showing:
- Deployment mode
- Database type
- Cache type
- Worker mode
- Secrets provider
- Config provider
- Auth provider

### Security Information

| Field | Type | Description |
|-------|------|-------------|
| `secretsProvider` | string | Secrets provider (env/oci-vault) |
| `vaultConfigured` | boolean | Whether OCI Vault is configured |
| `httpsEnabled` | boolean | Whether HTTPS is enabled |

### Observability Configuration

Shows observability setup:
- Metrics enabled status
- Logging enabled status
- Tracing enabled status
- Log ingestion configuration (OCI Logging)
- Metrics ingestion configuration (OCI Monitoring)

## Security Considerations

### Sensitive Data Masking

The endpoint masks sensitive information:
- **Database URLs:** Shows only protocol, host, and path
- **API Keys/Secrets:** Shows first 4 and last 4 characters with `...`
- **Vault/Compartment OCIDs:** Shows masked format

### Access Control

**Current Status:** No authentication required (public endpoint)

**⚠️ Production Note:** Consider restricting access to this endpoint:
- Add API key authentication
- Restrict to internal network
- Rate limit requests

**Source:** No authentication middleware applied in `server/routes/system.ts`.

## Use Cases

### 1. System Diagnostics

Quick overview of system configuration and health:

```bash
curl http://localhost:3000/api/system/info | jq '.services'
```

### 2. Deployment Verification

Verify deployment configuration after deployment:

```bash
curl http://localhost:3000/api/system/info | jq '.deployment'
```

### 3. Feature Flag Verification

Check which features are enabled:

```bash
curl http://localhost:3000/api/system/info | jq '.features'
```

### 4. Service Health Monitoring

Monitor service health status:

```bash
curl http://localhost:3000/api/system/info | jq '.services.database.status'
```

### 5. Observability Setup Verification

Verify observability configuration:

```bash
curl http://localhost:3000/api/system/info | jq '.observability'
```

## Performance

- **Response Time:** Typically 50-200ms (depends on health check latency)
- **Health Checks:** Performed in parallel for optimal performance
- **Caching:** Response is not cached (always returns current state)

**Source:** Health checks executed in parallel in `server/routes/system.ts` line 59.

## Error Handling

**Status:** `500 Internal Server Error`

**Body:**
```json
{
  "error": "Failed to gather system information",
  "message": "Error details"
}
```

**Source:** Error handling in `server/routes/system.ts` lines 22-28.

## Implementation

The endpoint gathers information from:
- Environment variables
- Deployment configuration (`server/config/deployment.ts`)
- Service health checks (database, cache, workers)
- Application metadata

**Source:** Implementation in `server/routes/system.ts` lines 30-457.

## Integration with Monitoring

This endpoint can be used with:
- **OCI Monitoring:** Create custom metrics from system info
- **OCI Logging:** Log system info for audit trails
- **Dashboards:** Display system configuration and health
- **Alarms:** Monitor service health status changes

## Example Usage

### Check Database Health

```bash
curl http://localhost:3000/api/system/info | jq '.services.database'
```

### Check All Service Status

```bash
curl http://localhost:3000/api/system/info | jq '.services | {database: .database.status, cache: .cache.status, workers: .workers.status}'
```

### Verify Chaos Engineering Status

```bash
curl http://localhost:3000/api/system/info | jq '.features.chaosEngineering'
```

## Related Endpoints

- [`GET /api/health`](06-health-api.md#health-check-liveness) - Simple health check
- [`GET /api/health/ready`](06-health-api.md#readiness-probe) - Readiness probe
- [`GET /metrics`](07-metrics-api.md) - Prometheus metrics

## Next Steps

- [Health API](06-health-api.md) - Health check endpoints
- [Metrics API](07-metrics-api.md) - Prometheus metrics endpoint
- [Troubleshooting Guide](../10-troubleshooting/01-troubleshooting-overview.md) - Diagnostic procedures

