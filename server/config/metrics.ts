import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

register.setDefaultLabels({
  app: 'sre-training-platform',
  environment: process.env.NODE_ENV || 'development',
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const orderCreatedTotal = new Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  labelNames: ['status'],
  registers: [register],
});

export const orderValueTotal = new Counter({
  name: 'orders_value_total',
  help: 'Total value of all orders in currency units',
  registers: [register],
});

export const paymentProcessedTotal = new Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status', 'payment_method'],
  registers: [register],
});

export const paymentValueTotal = new Counter({
  name: 'payments_value_total',
  help: 'Total value of all payments in currency units',
  labelNames: ['status'],
  registers: [register],
});

export const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'endpoint'],
  registers: [register],
});

export const ordersSuccessTotal = new Counter({
  name: 'orders_success_total',
  help: 'Total number of successful orders',
  registers: [register],
});

export const ordersFailedTotal = new Counter({
  name: 'orders_failed_total',
  help: 'Total number of failed orders',
  registers: [register],
});

export const chaosEventsTotal = new Counter({
  name: 'chaos_events_total',
  help: 'Total number of chaos engineering events',
  registers: [register],
});

export const simulatedLatencyMs = new Gauge({
  name: 'simulated_latency_ms',
  help: 'Simulated latency injected in milliseconds',
  registers: [register],
});

export const serviceRestartsTotal = new Counter({
  name: 'service_restarts_total',
  help: 'Total number of service restarts',
  registers: [register],
});

export const externalCallLatencyMs = new Histogram({
  name: 'external_call_latency_ms',
  help: 'Latency of external calls in milliseconds',
  labelNames: ['dependency'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

export const retryAttemptsTotal = new Counter({
  name: 'retry_attempts_total',
  help: 'Total number of retry attempts',
  labelNames: ['dependency'],
  registers: [register],
});

export const circuitBreakerOpenTotal = new Counter({
  name: 'circuit_breaker_open_total',
  help: 'Total number of circuit breaker openings',
  registers: [register],
});
