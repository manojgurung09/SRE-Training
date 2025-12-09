import dotenv from 'dotenv';
dotenv.config();

import './tracing';

import { serviceRestartsTotal } from './config/metrics';
import { logger } from './config/logger';
import app from './app';

const PORT = Number(process.env.PORT) || 3000;

// ✅ SINGLE, SECURE, GUARDED SERVER START
async function startServer() {
  const server = app.listen(PORT, () => {
    serviceRestartsTotal.inc();
    logger.info('Server started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: `/api/health`,
        metrics: `/metrics`,
        api_docs: `/`,
      },
    });
    console.log(`🚀 Server running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    }
    throw err;
  });
}

startServer();

// IMMEDIATE TEST - Log right after server starts
setTimeout(() => {
  console.log('🧪 Testing logger after 1 second...');
  logger.info('Test log from server startup');
}, 1000);

// App is exported from server/app.ts for testing
