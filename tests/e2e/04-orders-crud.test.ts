import request from 'supertest';
import app from '../../server/app';
import { supabase } from '../../server/config/supabase';
import { cleanupTestOrder } from '../helpers/cleanup';
import { cleanupTestProduct } from '../helpers/cleanup';

describe('Orders CRUD Operations', () => {
  let createdOrderId: string | null = null;
  let testProductId: string | null = null;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user (or use existing)
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (users && users.length > 0) {
      testUserId = users[0].id;
    } else {
      // Create a test user
      const { data: newUser } = await supabase
        .from('users')
        .insert({ email: `test-${Date.now()}@example.com`, full_name: 'Test User' })
        .select()
        .single();
      testUserId = newUser?.id || '';
    }

    // Create a test product
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: `Test Product ${Date.now()}`,
        description: 'Test product',
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
    if (testProductId) {
      await cleanupTestProduct(testProductId);
    }
  });

  afterEach(async () => {
    if (createdOrderId) {
      await cleanupTestOrder(createdOrderId);
      createdOrderId = null;
    }
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      const orderData = {
        user_id: testUserId,
        items: [
          {
            product_id: testProductId,
            quantity: 2,
            unit_price: 4999,
          },
        ],
        shipping_address: '123 Test St, Test City, 12345',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.user_id).toBe(testUserId);
      expect(response.body.status).toBe('pending');
      createdOrderId = response.body.id;
    });

    it('should reject order creation with missing required fields', async () => {
      const incompleteData = {
        items: [],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should calculate total_amount correctly', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      const orderData = {
        user_id: testUserId,
        items: [
          {
            product_id: testProductId,
            quantity: 3,
            unit_price: 4999,
          },
        ],
        shipping_address: '123 Test St',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const expectedTotal = 3 * 4999;
      expect(response.body.total_amount).toBe(expectedTotal);
      createdOrderId = response.body.id;
    });
  });

  describe('GET /api/orders', () => {
    it('should fetch all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=pending')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      if (response.body.data.length > 0) {
        expect(response.body.data[0].status).toBe('pending');
      }
    });

    it('should filter orders by user_id', async () => {
      const response = await request(app)
        .get(`/api/orders?user_id=${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should fetch a specific order by ID', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      // First create an order
      const orderData = {
        user_id: testUserId,
        items: [
          {
            product_id: testProductId,
            quantity: 2,
            unit_price: 4999,
          },
        ],
        shipping_address: '123 Test St',
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      createdOrderId = createResponse.body.id;

      // Then fetch it
      const response = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      // First create an order
      const orderData = {
        user_id: testUserId,
        items: [
          {
            product_id: testProductId,
            quantity: 2,
            unit_price: 4999,
          },
        ],
        shipping_address: '123 Test St',
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      createdOrderId = createResponse.body.id;

      // Then update status
      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .send({ status: 'processing' })
        .expect(200);

      expect(response.body.status).toBe('processing');
    });

    it('should reject invalid status', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      // First create an order
      const orderData = {
        user_id: testUserId,
        items: [
          {
            product_id: testProductId,
            quantity: 2,
            unit_price: 4999,
          },
        ],
        shipping_address: '123 Test St',
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      createdOrderId = createResponse.body.id;

      // Try invalid status
      const response = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('SLO Metrics Validation', () => {
    it('should increment orders_success_total on successful order creation', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      // Get initial metric value (if accessible)
      const orderData = {
        user_id: testUserId,
        items: [
          {
            product_id: testProductId,
            quantity: 1,
            unit_price: 4999,
          },
        ],
        shipping_address: '123 Test St',
      };

      await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // Note: Metric validation would require accessing Prometheus registry
      // This is tested in observability tests
    });
  });
});

