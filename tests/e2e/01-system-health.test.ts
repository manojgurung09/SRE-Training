import request from 'supertest';
import app from '../../server/app';

describe('System & Health Gates', () => {
  describe('Environment Variables', () => {
    it('should have required SUPABASE_URL', () => {
      expect(process.env.SUPABASE_URL).toBeDefined();
      expect(process.env.SUPABASE_URL).not.toBe('');
    });

    it('should have required SUPABASE_SERVICE_ROLE_KEY', () => {
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).not.toBe('');
    });

    it('should have REDIS_URL configured (optional)', () => {
      // Redis is optional, but if CACHE_TYPE=redis, it should be set
      if (process.env.CACHE_TYPE === 'redis') {
        expect(process.env.REDIS_URL).toBeDefined();
      }
    });

    it('should have OTEL_EXPORTER_OTLP_ENDPOINT configured (optional)', () => {
      // OTLP endpoint is optional for tracing
      // Just verify it's a valid URL if set
      if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
        expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toMatch(/^https?:\/\//);
      }
    });

    it('should have OTEL_SERVICE_NAME configured (optional)', () => {
      // Service name is optional, defaults to bharatmart-backend
      if (process.env.OTEL_SERVICE_NAME) {
        expect(process.env.OTEL_SERVICE_NAME).not.toBe('');
      }
    });

    it('should have CHAOS_ENABLED configured (optional)', () => {
      // Chaos is optional
      if (process.env.CHAOS_ENABLED) {
        expect(['true', 'false']).toContain(process.env.CHAOS_ENABLED);
      }
    });
  });

  describe('Health Endpoint', () => {
    it('GET /api/health should return 200', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(response.body).toHaveProperty('ok');
      expect(response.body.ok).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Response time < 2s (allows for DB query)
    });

    it('GET /api/health should return valid structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('ok');
      expect(typeof response.body.ok).toBe('boolean');
    });
  });

  describe('Readiness Endpoint', () => {
    it('GET /api/health/ready should return 200', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ready');
      expect(responseTime).toBeLessThan(2000); // Response time < 2s (allows for DB query)
    });

    it('GET /api/health/ready should confirm database connectivity', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks.database).toBe('ok');
    });

    it('GET /api/health/ready should include timestamp', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Root Endpoint', () => {
    it('GET / should return API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('running');
    });
  });
});

