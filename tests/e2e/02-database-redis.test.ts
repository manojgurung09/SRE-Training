import { supabase } from '../../server/config/supabase';
import { getRedisClient } from '../../server/config/redis';

describe('Database & Redis Integration', () => {
  const testTableName = 'products'; // Using existing table for testing

  describe('Supabase Database Operations', () => {
    let testRecordId: string | null = null;

    afterEach(async () => {
      // Cleanup test record if created
      if (testRecordId) {
        try {
          await supabase.from(testTableName).delete().eq('id', testRecordId);
        } catch (error) {
          // Ignore cleanup errors
        }
        testRecordId = null;
      }
    });

    it('should insert a test record', async () => {
      const testData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test description',
        price: 9999,
        category: 'electronics',
        stock_quantity: 10,
        sku: `TEST-${Date.now()}`,
      };

      const { data, error } = await supabase
        .from(testTableName)
        .insert(testData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBeDefined();
      testRecordId = data?.id || null;
    });

    it('should read the inserted record', async () => {
      // First insert
      const testData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test description',
        price: 9999,
        category: 'electronics',
        stock_quantity: 10,
        sku: `TEST-${Date.now()}`,
      };

      const { data: inserted, error: insertError } = await supabase
        .from(testTableName)
        .insert(testData)
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(inserted).toBeDefined();
      testRecordId = inserted?.id || null;

      // Then read
      const { data: read, error: readError } = await supabase
        .from(testTableName)
        .select('*')
        .eq('id', testRecordId!)
        .single();

      expect(readError).toBeNull();
      expect(read).toBeDefined();
      expect(read?.id).toBe(testRecordId);
      expect(read?.name).toBe(testData.name);
    });

    it('should delete the test record', async () => {
      // First insert
      const testData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test description',
        price: 9999,
        category: 'electronics',
        stock_quantity: 10,
        sku: `TEST-${Date.now()}`,
      };

      const { data: inserted, error: insertError } = await supabase
        .from(testTableName)
        .insert(testData)
        .select()
        .single();

      expect(insertError).toBeNull();
      const recordId = inserted?.id;
      expect(recordId).toBeDefined();

      // Then delete
      const { error: deleteError } = await supabase
        .from(testTableName)
        .delete()
        .eq('id', recordId!);

      expect(deleteError).toBeNull();

      // Verify deletion
      const { data: read, error: readError } = await supabase
        .from(testTableName)
        .select('*')
        .eq('id', recordId!)
        .maybeSingle();

      expect(readError).toBeNull();
      expect(read).toBeNull();
    });
  });

  describe('Redis Operations', () => {
    const redis = getRedisClient();
    const testKey = `test:${Date.now()}`;
    const testValue = 'test-value';

    afterEach(async () => {
      // Cleanup test key
      if (redis) {
        try {
          await redis.del(testKey);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });

    it('should set a key in Redis (if Redis is enabled)', async () => {
      if (!redis || process.env.CACHE_TYPE !== 'redis') {
        console.log('Skipping Redis test - Redis not enabled');
        return;
      }

      const result = await redis.set(testKey, testValue);
      expect(result).toBe('OK');
    });

    it('should get a key from Redis (if Redis is enabled)', async () => {
      if (!redis || process.env.CACHE_TYPE !== 'redis') {
        console.log('Skipping Redis test - Redis not enabled');
        return;
      }

      await redis.set(testKey, testValue);
      const value = await redis.get(testKey);
      expect(value).toBe(testValue);
    });

    it('should set TTL on a key (if Redis is enabled)', async () => {
      if (!redis || process.env.CACHE_TYPE !== 'redis') {
        console.log('Skipping Redis test - Redis not enabled');
        return;
      }

      await redis.set(testKey, testValue, 'EX', 10); // 10 seconds TTL
      const ttl = await redis.ttl(testKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(10);
    });

    it('should delete a key from Redis (if Redis is enabled)', async () => {
      if (!redis || process.env.CACHE_TYPE !== 'redis') {
        console.log('Skipping Redis test - Redis not enabled');
        return;
      }

      await redis.set(testKey, testValue);
      const deleted = await redis.del(testKey);
      expect(deleted).toBe(1);

      const value = await redis.get(testKey);
      expect(value).toBeNull();
    });
  });
});

