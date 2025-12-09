import dotenv from 'dotenv';
dotenv.config();

import './tracing';

import express from 'express';
import cors from 'cors';
import { logApiEvent } from './middleware/logger';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { register } from './config/metrics';
import { logger } from './config/logger';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import systemRoutes from './routes/system';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import paymentsRoutes from './routes/payments';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: [
    FRONTEND_URL,
    'http://localhost:5173',
    'http://40.81.230.114:5173',
    'http://localhost:3000',
    'http://40.81.230.114:3000',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(metricsMiddleware);
app.use(logApiEvent);

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api', systemRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);

app.get('/', (_req, res) => {
  res.json({
    name: 'BharatMart API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
      ready: '/api/health/ready',
      systemInfo: '/api/system/info',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
    },
  });
});

// Test endpoint to verify logging works
app.get('/api/test-log', (_req, res) => {
  logger.info('Test log endpoint called');
  res.json({ message: 'Check logs/api.log for this entry', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

