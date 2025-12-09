import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../config/redis';
import { logger } from '../config/logger';

export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
  generateKey?: (req: Request) => string;
}

export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300,
    keyPrefix = 'api',
    generateKey = (req: Request) => `${keyPrefix}:${req.method}:${req.originalUrl}`,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateKey(req);

    try {
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        logger.info(`Cache hit for key: ${cacheKey}`);
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      logger.info(`Cache miss for key: ${cacheKey}`);
      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        cacheService.set(cacheKey, data, ttl).catch((error) => {
          logger.error(`Failed to cache data for key ${cacheKey}:`, error);
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const count = await cacheService.invalidatePattern(pattern);
    logger.info(`Invalidated ${count} cache keys matching pattern: ${pattern}`);
    return count;
  } catch (error) {
    logger.error(`Failed to invalidate cache pattern ${pattern}:`, error);
    return 0;
  }
}
