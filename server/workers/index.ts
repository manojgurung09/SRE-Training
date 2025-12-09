import dotenv from 'dotenv';
import { logger } from '../config/logger';

dotenv.config();

const WORKER_TYPE = process.env.WORKER_TYPE || 'all';

logger.info('Starting worker process', {
  workerType: WORKER_TYPE,
  nodeEnv: process.env.NODE_ENV,
  redisUrl: process.env.QUEUE_REDIS_URL ? 'configured' : 'missing',
});

async function startWorkers() {
  try {
    switch (WORKER_TYPE) {
      case 'email':
        logger.info('Starting email worker...');
        await import('./emailWorker');
        break;

      case 'order':
        logger.info('Starting order worker...');
        await import('./orderWorker');
        break;

      case 'payment':
        logger.info('Starting payment worker...');
        await import('./paymentWorker');
        break;

      case 'all':
        logger.info('Starting all workers...');
        await Promise.all([
          import('./emailWorker'),
          import('./orderWorker'),
          import('./paymentWorker'),
        ]);
        break;

      default:
        logger.error(`Unknown worker type: ${WORKER_TYPE}`);
        process.exit(1);
    }

    logger.info('Workers started successfully', { workerType: WORKER_TYPE });
  } catch (error) {
    logger.error('Failed to start workers', { error, workerType: WORKER_TYPE });
    process.exit(1);
  }
}

startWorkers();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down workers gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down workers gracefully');
  process.exit(0);
});
