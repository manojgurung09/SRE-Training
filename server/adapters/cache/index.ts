import { deploymentConfig } from '../../config/deployment';
import { MemoryCacheAdapter } from './memory';
import { RedisCacheAdapter } from './redis';

export interface ICacheAdapter {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export function createCacheAdapter(): ICacheAdapter {
  console.log(`💾 Initializing ${deploymentConfig.cacheType} cache adapter...`);

  switch (deploymentConfig.cacheType) {
    case 'memory':
      return new MemoryCacheAdapter();
    case 'redis':
    case 'oci-cache':
      return new RedisCacheAdapter();
    default:
      console.warn(`⚠️  Unknown cache type: ${deploymentConfig.cacheType}, using memory`);
      return new MemoryCacheAdapter();
  }
}

export const cacheAdapter = createCacheAdapter();
