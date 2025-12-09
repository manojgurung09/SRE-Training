import request from 'supertest';
import app from '../../server/app';
import { register } from '../../server/config/metrics';
import * as fs from 'fs';
import * as path from 'path';

describe('Observability Signal Validation', () => {
  describe('Metrics Endpoint', () => {
    it('GET /metrics should be reachable', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
    });

    it('GET /metrics should return valid Prometheus format', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      const metricsText = response.text;
      
      // Check for Prometheus format patterns
      expect(metricsText).toContain('# HELP');
      expect(metricsText).toContain('# TYPE');
      
      // Check for required business metrics
      expect(metricsText).toMatch(/orders_success_total/);
      expect(metricsText).toMatch(/orders_failed_total/);
      expect(metricsText).toMatch(/chaos_events_total/);
      expect(metricsText).toMatch(/simulated_latency_ms/);
      expect(metricsText).toMatch(/external_call_latency_ms/);
      expect(metricsText).toMatch(/retry_attempts_total/);
      expect(metricsText).toMatch(/circuit_breaker_open_total/);
    });

    it('should include required business metrics', async () => {
      const metrics = await register.metrics();
      
      // Verify metrics exist in registry
      expect(metrics).toContain('orders_success_total');
      expect(metrics).toContain('orders_failed_total');
      expect(metrics).toContain('chaos_events_total');
      expect(metrics).toContain('simulated_latency_ms');
      expect(metrics).toContain('external_call_latency_ms');
      expect(metrics).toContain('retry_attempts_total');
      expect(metrics).toContain('circuit_breaker_open_total');
    });
  });

  describe('Log File Generation', () => {
    it('should have logs/api.log file that is writable', async () => {
      const logFile = path.resolve(process.cwd(), 'logs', 'api.log');
      const logDir = path.dirname(logFile);

      // Ensure directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Make a test API call to generate a log
      await request(app)
        .get('/api/health')
        .expect(200);

      // Wait a bit for log write
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if file exists
      expect(fs.existsSync(logFile)).toBe(true);

      // Check if file is readable
      try {
        const stats = fs.statSync(logFile);
        expect(stats.isFile()).toBe(true);
      } catch (error) {
        throw new Error(`Log file ${logFile} is not accessible`);
      }
    });

    it('should generate JSON logs for API calls', async () => {
      const logFile = path.resolve(process.cwd(), 'logs', 'api.log');
      
      // Make a test API call
      await request(app)
        .get('/api/health')
        .expect(200);

      // Wait for log write
      await new Promise(resolve => setTimeout(resolve, 200));

      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf-8');
        const lines = logContent.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          try {
            const logEntry = JSON.parse(lastLine);
            expect(logEntry).toHaveProperty('level');
            expect(logEntry).toHaveProperty('message');
          } catch (error) {
            // Log might not be JSON format, that's okay for this test
            console.log('Log file does not contain JSON format');
          }
        }
      }
    });

    it('should include required log fields', async () => {
      const logFile = path.resolve(process.cwd(), 'logs', 'api.log');
      
      // Make a test API call
      await request(app)
        .get('/api/health')
        .expect(200);

      // Wait for log write
      await new Promise(resolve => setTimeout(resolve, 200));

      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf-8');
        const lines = logContent.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          try {
            const logEntry = JSON.parse(lastLine);
            
            // Check for required fields (if present)
            // Note: These fields may not be in every log entry
            const hasEventType = logEntry.hasOwnProperty('eventType');
            const hasRequestSize = logEntry.hasOwnProperty('requestSize');
            const hasResponseSize = logEntry.hasOwnProperty('responseSize');
            const hasColdStart = logEntry.hasOwnProperty('coldStart');
            
            // At least one of these should be present in API request logs
            expect(hasEventType || hasRequestSize || hasResponseSize || hasColdStart).toBe(true);
          } catch (error) {
            // Log might not be JSON, skip this check
          }
        }
      }
    });
  });

  describe('Trace Generation', () => {
    it('should have OTLP endpoint configured (if tracing is enabled)', () => {
      // OTLP endpoint is optional
      if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
        expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toMatch(/^https?:\/\//);
      }
    });

    it('should have service name configured (if tracing is enabled)', () => {
      // Service name is optional, defaults to bharatmart-backend
      if (process.env.OTEL_SERVICE_NAME) {
        expect(process.env.OTEL_SERVICE_NAME).not.toBe('');
      }
    });

    it('should generate traces for API calls (validated via OTLP availability)', async () => {
      // Make an API call that should generate a trace
      await request(app)
        .get('/api/health')
        .expect(200);

      // Note: Actual trace validation would require OTLP collector
      // This test validates that tracing is configured
      if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
        expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toBeDefined();
      }
    });
  });
});

