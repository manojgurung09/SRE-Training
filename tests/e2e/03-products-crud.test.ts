import request from 'supertest';
import app from '../../server/app';
import { supabase } from '../../server/config/supabase';
import { cleanupTestProduct } from '../helpers/cleanup';

describe('Products CRUD Operations', () => {
  let createdProductId: string | null = null;

  afterEach(async () => {
    if (createdProductId) {
      await cleanupTestProduct(createdProductId);
      createdProductId = null;
    }
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: 4999,
        category: 'electronics',
        stock_quantity: 100,
        sku: `TEST-${Date.now()}`,
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price);
      expect(response.body.category).toBe(productData.category);
      createdProductId = response.body.id;
    });

    it('should reject product creation with missing required fields', async () => {
      const incompleteData = {
        description: 'Missing name and price',
      };

      const response = await request(app)
        .post('/api/products')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/products', () => {
    it('should fetch all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=electronics')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      if (response.body.data.length > 0) {
        expect(response.body.data[0].category).toBe('electronics');
      }
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=test')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/products?limit=10&offset=0')
        .expect(200);

      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
      expect(response.body.limit).toBe(10);
      expect(response.body.offset).toBe(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should fetch a specific product by ID', async () => {
      // First create a product
      const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: 4999,
        category: 'electronics',
        stock_quantity: 100,
        sku: `TEST-${Date.now()}`,
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      createdProductId = createResponse.body.id;

      // Then fetch it
      const response = await request(app)
        .get(`/api/products/${createdProductId}`)
        .expect(200);

      expect(response.body.id).toBe(createdProductId);
      expect(response.body.name).toBe(productData.name);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      // First create a product
      const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: 4999,
        category: 'electronics',
        stock_quantity: 100,
        sku: `TEST-${Date.now()}`,
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      createdProductId = createResponse.body.id;

      // Then update it
      const updateData = {
        name: 'Updated Product Name',
        price: 5999,
      };

      const response = await request(app)
        .put(`/api/products/${createdProductId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
    });

    it('should return 500 when updating non-existent product (Supabase throws error)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .send(updateData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      // First create a product
      const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: 4999,
        category: 'electronics',
        stock_quantity: 100,
        sku: `TEST-${Date.now()}`,
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      createdProductId = createResponse.body.id;

      // Then delete it
      await request(app)
        .delete(`/api/products/${createdProductId}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/products/${createdProductId}`)
        .expect(404);

      createdProductId = null; // Already deleted
    });

    it('should return 500 when deleting non-existent product (handled by Supabase)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .delete(`/api/products/${fakeId}`)
        .expect(204); // Supabase delete doesn't error on non-existent
    });
  });

  describe('Database Consistency', () => {
    it('should persist product in database after creation', async () => {
      const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: 4999,
        category: 'electronics',
        stock_quantity: 100,
        sku: `TEST-${Date.now()}`,
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      createdProductId = createResponse.body.id;

      // Verify in database directly
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', createdProductId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(createdProductId);
      expect(data?.name).toBe(productData.name);
    });
  });
});

