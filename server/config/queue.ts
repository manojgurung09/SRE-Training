import Bull, { Queue, Job } from 'bull';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WORKER_MODE = process.env.WORKER_MODE || 'none';

export interface OrderProcessingJob {
  orderId: string;
  userId: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export interface EmailNotificationJob {
  to: string;
  subject: string;
  body: string;
  type: 'order_confirmation' | 'payment_success' | 'payment_failed';
  orderId: string;
}

export interface PaymentProcessingJob {
  orderId: string;
  amount: number;
  paymentMethod: string;
  userId: string;
}

let orderQueue: Queue<OrderProcessingJob> | null = null;
let emailQueue: Queue<EmailNotificationJob> | null = null;
let paymentQueue: Queue<PaymentProcessingJob> | null = null;

function initializeQueues() {
  if (WORKER_MODE !== 'bull-queue') {
    return;
  }

  if (orderQueue) return;

  orderQueue = new Bull('order-processing', REDIS_URL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });

  emailQueue = new Bull('email-notifications', REDIS_URL, {
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 50,
      removeOnFail: 25,
    },
  });

  paymentQueue = new Bull('payment-processing', REDIS_URL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });

  orderQueue.on('error', (error) => {
    logger.error('Order queue error:', error);
  });

  emailQueue.on('error', (error) => {
    logger.error('Email queue error:', error);
  });

  paymentQueue.on('error', (error) => {
    logger.error('Payment queue error:', error);
  });

  orderQueue.on('completed', (job: Job) => {
    logger.info(`Order processing job ${job.id} completed`);
  });

  emailQueue.on('completed', (job: Job) => {
    logger.info(`Email notification job ${job.id} completed`);
  });

  paymentQueue.on('completed', (job: Job) => {
    logger.info(`Payment processing job ${job.id} completed`);
  });

  orderQueue.on('failed', (job: Job, err: Error) => {
    logger.error(`Order processing job ${job.id} failed:`, err);
  });

  emailQueue.on('failed', (job: Job, err: Error) => {
    logger.error(`Email notification job ${job.id} failed:`, err);
  });

  paymentQueue.on('failed', (job: Job, err: Error) => {
    logger.error(`Payment processing job ${job.id} failed:`, err);
  });
}

export const queueService = {
  async addOrderToQueue(data: OrderProcessingJob): Promise<Job<OrderProcessingJob> | null> {
    initializeQueues();
    if (!orderQueue) {
      logger.warn('Order queue not initialized (WORKER_MODE is not bull-queue)');
      return null;
    }
    return orderQueue.add(data, { priority: 1 });
  },

  async addEmailToQueue(data: EmailNotificationJob): Promise<Job<EmailNotificationJob> | null> {
    initializeQueues();
    if (!emailQueue) {
      logger.warn('Email queue not initialized (WORKER_MODE is not bull-queue)');
      return null;
    }
    return emailQueue.add(data, {
      priority: data.type === 'payment_failed' ? 2 : 3,
    });
  },

  async addPaymentToQueue(data: PaymentProcessingJob): Promise<Job<PaymentProcessingJob> | null> {
    initializeQueues();
    if (!paymentQueue) {
      logger.warn('Payment queue not initialized (WORKER_MODE is not bull-queue)');
      return null;
    }
    return paymentQueue.add(data, { priority: 1 });
  },

  async getQueueStats() {
    initializeQueues();
    if (!orderQueue || !emailQueue || !paymentQueue) {
      return {
        orders: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 },
        emails: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 },
        payments: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 },
      };
    }

    const [orderStats, emailStats, paymentStats] = await Promise.all([
      orderQueue.getJobCounts(),
      emailQueue.getJobCounts(),
      paymentQueue.getJobCounts(),
    ]);

    return {
      orders: orderStats,
      emails: emailStats,
      payments: paymentStats,
    };
  },
};

export function getOrderQueue(): Queue<OrderProcessingJob> | null {
  initializeQueues();
  return orderQueue;
}

export function getEmailQueue(): Queue<EmailNotificationJob> | null {
  initializeQueues();
  return emailQueue;
}

export function getPaymentQueue(): Queue<PaymentProcessingJob> | null {
  initializeQueues();
  return paymentQueue;
}
