import request from 'supertest';
import app from '../../server/app';
import { supabase } from '../../server/config/supabase';
import { cleanupTestPayment } from '../helpers/cleanup';
import { cleanupTestOrder } from '../helpers/cleanup';
import { cleanupTestProduct } from '../helpers/cleanup';

describe('Payments CRUD Operations', () => {
  let createdPaymentId: string | null = null;
  let testOrderId: string | null = null;
  let testProductId: string | null = null;
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
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

    // Create a test order
    if (testProductId) {
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

      // Create order items
      if (testOrderId) {
        await supabase.from('order_items').insert({
          order_id: testOrderId,
          product_id: testProductId,
          quantity: 2,
          unit_price: 4999,
        });
      }
    }
  });

  afterAll(async () => {
    if (testOrderId) {
      await cleanupTestOrder(testOrderId);
    }
    if (testProductId) {
      await cleanupTestProduct(testProductId);
    }
  });

  afterEach(async () => {
    if (createdPaymentId) {
      await cleanupTestPayment(createdPaymentId);
      createdPaymentId = null;
    }
  });

  describe('POST /api/payments', () => {
    it('should create a new payment', async () => {
      if (!testOrderId) {
        console.log('Skipping test - no test order available');
        return;
      }

      const paymentData = {
        order_id: testOrderId,
        amount: 9998,
        payment_method: 'credit_card',
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.order_id).toBe(testOrderId);
      expect(response.body.amount).toBe(paymentData.amount);
      expect(response.body.payment_method).toBe(paymentData.payment_method);
      expect(['completed', 'failed']).toContain(response.body.status);
      createdPaymentId = response.body.id;
    });

    it('should reject payment creation with missing required fields', async () => {
      const incompleteData = {
        amount: 9998,
      };

      const response = await request(app)
        .post('/api/payments')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/payments', () => {
    it('should fetch all payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter payments by status', async () => {
      const response = await request(app)
        .get('/api/payments?status=completed')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      if (response.body.data.length > 0) {
        expect(['completed', 'failed']).toContain(response.body.data[0].status);
      }
    });

    it('should filter payments by order_id', async () => {
      if (!testOrderId) {
        console.log('Skipping test - no test order available');
        return;
      }

      const response = await request(app)
        .get(`/api/payments?order_id=${testOrderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should fetch a specific payment by ID', async () => {
      if (!testOrderId) {
        console.log('Skipping test - no test order available');
        return;
      }

      // First create a payment
      const paymentData = {
        order_id: testOrderId,
        amount: 9998,
        payment_method: 'credit_card',
      };

      const createResponse = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);

      createdPaymentId = createResponse.body.id;

      // Then fetch it
      const response = await request(app)
        .get(`/api/payments/${createdPaymentId}`)
        .expect(200);

      expect(response.body.id).toBe(createdPaymentId);
      expect(response.body.order_id).toBe(testOrderId);
    });

    it('should return 404 for non-existent payment', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/payments/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/payments/:id/status', () => {
    it('should update payment status', async () => {
      if (!testOrderId) {
        console.log('Skipping test - no test order available');
        return;
      }

      // First create a payment
      const paymentData = {
        order_id: testOrderId,
        amount: 9998,
        payment_method: 'credit_card',
      };

      const createResponse = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);

      createdPaymentId = createResponse.body.id;

      // Then update status
      const response = await request(app)
        .patch(`/api/payments/${createdPaymentId}/status`)
        .send({ status: 'refunded' })
        .expect(200);

      expect(response.body.status).toBe('refunded');
    });

    it('should reject invalid status', async () => {
      if (!testOrderId) {
        console.log('Skipping test - no test order available');
        return;
      }

      // First create a payment
      const paymentData = {
        order_id: testOrderId,
        amount: 9998,
        payment_method: 'credit_card',
      };

      const createResponse = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);

      createdPaymentId = createResponse.body.id;

      // Try invalid status
      const response = await request(app)
        .patch(`/api/payments/${createdPaymentId}/status`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

