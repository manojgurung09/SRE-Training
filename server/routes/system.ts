import { Router, Request, Response } from 'express';
import { deploymentConfig } from '../config/deployment';
import { supabase } from '../config/supabase';
import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';
import { cacheAdapter } from '../adapters/cache';
import process from 'process';

const router = Router();

// Track application start time for uptime calculation
const appStartTime = Date.now();

/**
 * GET /api/system/info
 * 
 * Returns comprehensive system information including:
 * - Application details (name, version, uptime)
 * - Deployment configuration
 * - Feature flags (metrics, logging, tracing, chaos)
 * - Service health status (database, cache, workers)
 * - Service configurations
 * - Observability configuration
 */
router.get('/system/info', async (_req: Request, res: Response) => {
  try {
    const info = await gatherSystemInfo();
    res.json(info);
  } catch (error) {
    logger.error('Error gathering system info:', error);
    res.status(500).json({
      error: 'Failed to gather system information',
      message: (error as Error).message
    });
  }
});

async function gatherSystemInfo() {
  const now = Date.now();
  const uptime = Math.floor((now - appStartTime) / 1000);

  // Gather all information in parallel for better performance
  const [dbHealth, cacheHealth, workerHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkCacheHealth(),
    checkWorkerHealth()
  ]);

  return {
    application: {
      name: 'BharatMart API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptime,
      startTime: new Date(appStartTime).toISOString(),
      timestamp: new Date().toISOString()
    },
    deployment: {
      mode: deploymentConfig.mode,
      host: process.env.HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '3000', 10),
      region: process.env.OCI_REGION || null,
      compartment: maskSensitive(process.env.OCI_COMPARTMENT_ID)
    },
    features: {
      metrics: {
        enabled: process.env.ENABLE_METRICS !== 'false',
        endpoint: '/metrics',
        port: parseInt(process.env.METRICS_PORT || process.env.PORT || '3000', 10)
      },
      logging: {
        enabled: true,
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
        file: process.env.LOG_FILE || './logs/api.log'
      },
      tracing: {
        enabled: !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
        serviceName: process.env.OTEL_SERVICE_NAME || 'bharatmart-backend',
        exporterEndpoint: maskSensitive(process.env.OTEL_EXPORTER_OTLP_ENDPOINT),
        sampler: process.env.OTEL_TRACES_SAMPLER || 'always_on'
      },
      chaosEngineering: {
        enabled: process.env.CHAOS_ENABLED === 'true',
        latencyMs: parseInt(process.env.CHAOS_LATENCY_MS || '0', 10),
        randomFailures: false // Can be extended in future
      }
    },
    services: {
      database: dbHealth,
      cache: cacheHealth,
      workers: workerHealth
    },
    configuration: {
      deploymentMode: deploymentConfig.mode,
      databaseType: deploymentConfig.databaseType,
      cacheType: deploymentConfig.cacheType,
      workerMode: deploymentConfig.workerMode,
      secretsProvider: deploymentConfig.secretsProvider,
      configProvider: deploymentConfig.configProvider,
      authProvider: process.env.AUTH_PROVIDER || 'supabase'
    },
    security: {
      secretsProvider: deploymentConfig.secretsProvider,
      vaultConfigured: !!process.env.OCI_VAULT_OCID,
      httpsEnabled: process.env.HTTPS_ENABLED === 'true' || process.env.PORT === '443'
    },
    observability: {
      metricsEnabled: process.env.ENABLE_METRICS !== 'false',
      logsEnabled: true,
      tracingEnabled: !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      logIngestion: {
        configured: !!process.env.OCI_LOG_OCID,
        service: process.env.OCI_LOG_OCID ? 'OCI Logging' : null,
        logGroup: maskSensitive(process.env.OCI_LOG_GROUP_OCID)
      },
      metricsIngestion: {
        configured: !!process.env.OCI_METRICS_NAMESPACE,
        service: process.env.OCI_METRICS_NAMESPACE ? 'OCI Monitoring' : null,
        namespace: process.env.OCI_METRICS_NAMESPACE || null
      }
    },
    endpoints: {
      health: '/api/health',
      readiness: '/api/health/ready',
      metrics: '/metrics',
      info: '/api/system/info'
    }
  };
}

async function checkDatabaseHealth() {
  const startTime = Date.now();
  const dbType = deploymentConfig.databaseType;
  
  try {
    // Try a simple query to check database health
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    const dbUptime = error ? null : Math.floor((Date.now() - appStartTime) / 1000);
    
    // Get database URL based on type
    let dbUrl: string | null = null;
    if (dbType === 'supabase') {
      dbUrl = maskDatabaseUrl(process.env.SUPABASE_URL);
    } else if (dbType === 'postgresql') {
      dbUrl = maskDatabaseUrl(process.env.DATABASE_URL || process.env.POSTGRES_HOST);
    } else if (dbType === 'oci-autonomous') {
      dbUrl = maskDatabaseUrl(process.env.OCI_DB_CONNECTION_STRING);
    }
    
    return {
      type: dbType,
      status: error ? 'unhealthy' : 'healthy',
      connected: !error,
      uptime: dbUptime,
      config: {
        provider: dbType,
        url: dbUrl,
        poolMin: parseInt(process.env.DATABASE_POOL_MIN || '5', 10),
        poolMax: parseInt(process.env.DATABASE_POOL_MAX || '20', 10)
      },
      healthCheck: {
        lastCheck: new Date().toISOString(),
        responseTimeMs: responseTime,
        error: error ? error.message : null
      }
    };
  } catch (error) {
    return {
      type: dbType,
      status: 'unhealthy',
      connected: false,
      uptime: null,
      config: {
        provider: dbType,
        url: null
      },
      healthCheck: {
        lastCheck: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        error: (error as Error).message
      }
    };
  }
}

async function checkCacheHealth() {
  const cacheType = deploymentConfig.cacheType;
  
  if (cacheType === 'memory') {
    return {
      type: 'memory',
      status: 'healthy',
      enabled: true,
      uptime: Math.floor((Date.now() - appStartTime) / 1000),
      config: {
        type: 'memory',
        ttl: parseInt(process.env.CACHE_TTL || '300', 10),
        prefix: process.env.CACHE_PREFIX || 'bharatmart:cache'
      }
    };
  }
  
  // Check Redis/OCI Cache connection
  if (cacheType === 'redis' || cacheType === 'oci-cache') {
    try {
      // Try to get Redis client
      const redis = getRedisClient();
      
      if (!redis) {
        return {
          type: cacheType,
          status: 'not_configured',
          enabled: false,
          uptime: null,
          config: {
            type: cacheType,
            url: maskSensitive(process.env.CACHE_REDIS_URL || process.env.OCI_CACHE_ENDPOINT || process.env.REDIS_URL),
            ttl: parseInt(process.env.CACHE_TTL || '300', 10),
            prefix: process.env.CACHE_PREFIX || 'bharatmart:cache'
          },
          healthCheck: {
            lastCheck: new Date().toISOString(),
            error: 'Redis client not initialized'
          }
        };
      }
      
      const startTime = Date.now();
      // Test cache adapter with a simple operation
      const testKey = '__health_check__';
      await cacheAdapter.set(testKey, 'ok', 1);
      const value = await cacheAdapter.get(testKey);
      await cacheAdapter.delete(testKey);
      const responseTime = Date.now() - startTime;
      
      const isHealthy = value === 'ok';
      
      return {
        type: cacheType,
        status: isHealthy ? 'healthy' : 'unhealthy',
        enabled: true,
        uptime: isHealthy ? Math.floor((Date.now() - appStartTime) / 1000) : null,
        config: {
          type: cacheType,
          url: maskSensitive(process.env.CACHE_REDIS_URL || process.env.OCI_CACHE_ENDPOINT || process.env.REDIS_URL),
          ttl: parseInt(process.env.CACHE_TTL || '300', 10),
          prefix: process.env.CACHE_PREFIX || 'bharatmart:cache'
        },
        healthCheck: {
          lastCheck: new Date().toISOString(),
          responseTimeMs: responseTime,
          error: isHealthy ? null : 'Cache health check failed'
        }
      };
    } catch (error) {
      return {
        type: cacheType,
        status: 'unhealthy',
        enabled: true,
        uptime: null,
        config: {
          type: cacheType,
          url: maskSensitive(process.env.CACHE_REDIS_URL || process.env.OCI_CACHE_ENDPOINT || process.env.REDIS_URL),
          ttl: parseInt(process.env.CACHE_TTL || '300', 10),
          prefix: process.env.CACHE_PREFIX || 'bharatmart:cache'
        },
        healthCheck: {
          lastCheck: new Date().toISOString(),
          responseTimeMs: 0,
          error: (error as Error).message
        }
      };
    }
  }
  
  // Unknown cache type
  return {
    type: cacheType,
    status: 'not_configured',
    enabled: false,
    uptime: null,
    config: {
      type: cacheType
    }
  };
}

async function checkWorkerHealth() {
  const workerMode = deploymentConfig.workerMode;
  
  if (workerMode === 'none' || workerMode === 'in-process') {
    return {
      mode: workerMode,
      status: workerMode === 'in-process' ? 'enabled' : 'disabled',
      enabled: workerMode === 'in-process',
      uptime: workerMode === 'in-process' ? Math.floor((Date.now() - appStartTime) / 1000) : null,
      config: {
        mode: workerMode,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
        queueUrl: null
      },
      workers: {
        email: {
          status: workerMode === 'in-process' ? 'enabled' : 'disabled',
          uptime: workerMode === 'in-process' ? Math.floor((Date.now() - appStartTime) / 1000) : null
        },
        order: {
          status: workerMode === 'in-process' ? 'enabled' : 'disabled',
          uptime: workerMode === 'in-process' ? Math.floor((Date.now() - appStartTime) / 1000) : null
        },
        payment: {
          status: workerMode === 'in-process' ? 'enabled' : 'disabled',
          uptime: workerMode === 'in-process' ? Math.floor((Date.now() - appStartTime) / 1000) : null
        }
      }
    };
  }
  
  // Bull Queue or OCI Queue mode
  if (workerMode === 'bull-queue' || workerMode === 'oci-queue') {
    // Check if queue Redis is configured
    const queueUrl = process.env.QUEUE_REDIS_URL || process.env.REDIS_URL;
    
    if (!queueUrl) {
      return {
        mode: workerMode,
        status: 'not_configured',
        enabled: false,
        uptime: null,
        config: {
          mode: workerMode,
          concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
          queueUrl: null
        },
        healthCheck: {
          lastCheck: new Date().toISOString(),
          error: 'Queue Redis URL not configured'
        },
        workers: {
          email: { status: 'not_configured', uptime: null },
          order: { status: 'not_configured', uptime: null },
          payment: { status: 'not_configured', uptime: null }
        }
      };
    }
    
    // Try to check queue connection
    try {
      const redis = getRedisClient();
      if (redis) {
        const startTime = Date.now();
        const pong = await redis.ping();
        const responseTime = Date.now() - startTime;
        
        const isHealthy = pong === 'PONG';
        
        return {
          mode: workerMode,
          status: isHealthy ? 'enabled' : 'unhealthy',
          enabled: true,
          uptime: isHealthy ? Math.floor((Date.now() - appStartTime) / 1000) : null,
          config: {
            mode: workerMode,
            concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
            queueUrl: maskSensitive(queueUrl)
          },
          healthCheck: {
            lastCheck: new Date().toISOString(),
            responseTimeMs: responseTime,
            error: isHealthy ? null : 'Queue connection failed'
          },
          workers: {
            email: {
              status: isHealthy ? 'enabled' : 'unhealthy',
              uptime: isHealthy ? Math.floor((Date.now() - appStartTime) / 1000) : null
            },
            order: {
              status: isHealthy ? 'enabled' : 'unhealthy',
              uptime: isHealthy ? Math.floor((Date.now() - appStartTime) / 1000) : null
            },
            payment: {
              status: isHealthy ? 'enabled' : 'unhealthy',
              uptime: isHealthy ? Math.floor((Date.now() - appStartTime) / 1000) : null
            }
          }
        };
      }
    } catch (error) {
      return {
        mode: workerMode,
        status: 'unhealthy',
        enabled: true,
        uptime: null,
        config: {
          mode: workerMode,
          concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
          queueUrl: maskSensitive(queueUrl)
        },
        healthCheck: {
          lastCheck: new Date().toISOString(),
          error: (error as Error).message
        },
        workers: {
          email: { status: 'unhealthy', uptime: null },
          order: { status: 'unhealthy', uptime: null },
          payment: { status: 'unhealthy', uptime: null }
        }
      };
    }
  }
  
  // Unknown worker mode
  return {
    mode: workerMode,
    status: 'not_configured',
    enabled: false,
    uptime: null,
    config: {
      mode: workerMode
    },
    workers: {
      email: { status: 'not_configured', uptime: null },
      order: { status: 'not_configured', uptime: null },
      payment: { status: 'not_configured', uptime: null }
    }
  };
}

// Helper functions for masking sensitive data
function maskSensitive(value: string | undefined | null): string | null {
  if (!value) return null;
  if (value.length <= 8) return '***';
  return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}

function maskDatabaseUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    // If not a valid URL, return masked version
    return maskSensitive(url);
  }
}

export default router;

