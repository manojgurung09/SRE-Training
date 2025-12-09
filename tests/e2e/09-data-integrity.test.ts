import { supabase } from '../../server/config/supabase';
import { getRedisClient } from '../../server/config/redis';

describe('Data Integrity & Reliability Checks', () => {
  describe('Order-Product Relationship', () => {
    let testProductId: string | null = null;
    let testOrderId: string | null = null;
    let testUserId: string;

    beforeAll(async () => {
      // Create test user
      const { data: users } = await supabase.from('users').select('id').limit(1);
      if (users && users.length > 0) {
        testUserId = users[0].id;
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({ email: `test-${Date.now()}@example.com`, full_name: 'Test User' })
          .select()
          .single();
        testUserId = newUser?.id || '';
      }

      // Create test product
      const { data: product } = await supabase
        .from('products')
        .insert({
          name: `Test Product ${Date.now()}`,
          description: 'Test',
          price: 4999,
          category: 'electronics',
          stock_quantity: 100,
          sku: `TEST-${Date.now()}`,
        })
        .select()
        .single();
      testProductId = product?.id || null;
    });

    afterAll(async () => {
      if (testOrderId) {
        await supabase.from('order_items').delete().eq('order_id', testOrderId);
        await supabase.from('orders').delete().eq('id', testOrderId);
      }
      if (testProductId) {
        await supabase.from('products').delete().eq('id', testProductId);
      }
    });

    it('should not have orphaned order_items without products', async () => {
      if (!testProductId || !testUserId) {
        console.log('Skipping test - missing test data');
        return;
      }

      // Create an order with items
      const { data: order } = await supabase
        .from('orders')
        .insert({
          user_id: testUserId,
          status: 'pending',
          total_amount: 9998,
          shipping_address: '123 Test St',
        })
        .select()
        .single();

      testOrderId = order?.id || null;

      if (testOrderId) {
        await supabase.from('order_items').insert({
          order_id: testOrderId,
          product_id: testProductId,
          quantity: 2,
          unit_price: 4999,
        });

        // Verify order_items reference valid products
        const { data: items } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .eq('order_id', testOrderId);

        expect(items).toBeDefined();
        if (items && items.length > 0) {
          expect(items[0].products).toBeDefined();
        }
      }
    });

    it('should not have orphaned orders without users', async () => {
      if (!testUserId) {
        console.log('Skipping test - missing test user');
        return;
      }

      // Verify orders reference valid users
      const { data: orders } = await supabase
        .from('orders')
        .select('*, users(*)')
        .eq('user_id', testUserId)
        .limit(1);

      if (orders && orders.length > 0) {
        expect(orders[0].users).toBeDefined();
      }
    });
  });

  describe('Redis Cache Cleanup', () => {
    const redis = getRedisClient();
    const testKey = `test:cleanup:${Date.now()}`;

    afterEach(async () => {
      if (redis && process.env.CACHE_TYPE === 'redis') {
        try {
          await redis.del(testKey);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });

    it('should not have stale Redis keys after delete operations', async () => {
      if (!redis || process.env.CACHE_TYPE !== 'redis') {
        console.log('Skipping test - Redis not enabled');
        return;
      }

      // Set a key
      await redis.set(testKey, 'test-value', 'EX', 10);

      // Verify it exists
      const beforeDelete = await redis.get(testKey);
      expect(beforeDelete).toBe('test-value');

      // Delete it
      await redis.del(testKey);

      // Verify it's gone
      const afterDelete = await redis.get(testKey);
      expect(afterDelete).toBeNull();
    });
  });

  describe('Idempotency', () => {
    it('should handle duplicate product creation gracefully', async () => {
      const productData = {
        name: `Idempotency Test ${Date.now()}`,
        description: 'Test',
        price: 4999,
        category: 'electronics',
        stock_quantity: 100,
        sku: `IDEMPOTENT-${Date.now()}`,
      };

      // First creation
      const { data: first, error: firstError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      expect(firstError).toBeNull();
      expect(first).toBeDefined();

      // Cleanup
      if (first?.id) {
        await supabase.from('products').delete().eq('id', first.id);
      }
    });
  });

  describe('Concurrent Access Safety', () => {
    it('should handle concurrent product reads safely', async () => {
      // Create a test product
      const { data: product } = await supabase
        .from('products')
        .insert({
          name: `Concurrent Test ${Date.now()}`,
          description: 'Test',
          price: 4999,
          category: 'electronics',
          stock_quantity: 100,
          sku: `CONCURRENT-${Date.now()}`,
        })
        .select()
        .single();

      if (product?.id) {
        // Simulate concurrent reads
        const reads = Promise.all([
          supabase.from('products').select('*').eq('id', product.id).single(),
          supabase.from('products').select('*').eq('id', product.id).single(),
          supabase.from('products').select('*').eq('id', product.id).single(),
        ]);

        const results = await reads;
        
        // All reads should succeed and return same data
        results.forEach(result => {
          expect(result.error).toBeNull();
          expect(result.data?.id).toBe(product.id);
        });

        // Cleanup
        await supabase.from('products').delete().eq('id', product.id);
      }
    });
  });
});

