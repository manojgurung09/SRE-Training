import { ICacheAdapter } from './index';
import Redis from 'ioredis';
import { externalCallLatencyMs, retryAttemptsTotal } from '../../config/metrics';

export class RedisCacheAdapter implements ICacheAdapter {
  private client: Redis;

  constructor() {
    const url = process.env.CACHE_REDIS_URL || process.env.OCI_CACHE_ENDPOINT || 'redis://localhost:6379';
    this.client = new Redis(url, {
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('❌ Redis connection failed after 3 retries');
          return null;
        }
        retryAttemptsTotal.inc({ dependency: 'redis' });
        return Math.min(times * 1000, 3000);
      },
    });

    this.client.on('connect', () => {
      console.log('✅ Redis cache connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis cache error:', err.message);
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    const value = await this.client.get(key);
    const duration = Date.now() - startTime;
    externalCallLatencyMs.observe({ dependency: 'redis' }, duration);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const startTime = Date.now();

    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
    
    const duration = Date.now() - startTime;
    externalCallLatencyMs.observe({ dependency: 'redis' }, duration);
  }

  async delete(key: string): Promise<void> {
    const startTime = Date.now();
    await this.client.del(key);
    const duration = Date.now() - startTime;
    externalCallLatencyMs.observe({ dependency: 'redis' }, duration);
  }

  async clear(): Promise<void> {
    const startTime = Date.now();
    await this.client.flushdb();
    const duration = Date.now() - startTime;
    externalCallLatencyMs.observe({ dependency: 'redis' }, duration);
  }

  async has(key: string): Promise<boolean> {
    const startTime = Date.now();
    const exists = await this.client.exists(key);
    const duration = Date.now() - startTime;
    externalCallLatencyMs.observe({ dependency: 'redis' }, duration);
    return exists === 1;
  }
}
