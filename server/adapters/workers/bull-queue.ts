import { IWorkerAdapter, JobData } from './index';
import Queue from 'bull';

export class BullQueueWorker implements IWorkerAdapter {
  private queues: Map<string, Queue.Queue> = new Map();
  private redisUrl: string;

  constructor() {
    this.redisUrl = process.env.QUEUE_REDIS_URL || 'redis://localhost:6379';
  }

  private getQueue(jobType: string): Queue.Queue {
    if (!this.queues.has(jobType)) {
      const queue = new Queue(jobType, this.redisUrl, {
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      this.queues.set(jobType, queue);
      console.log(`📦 Created Bull queue: ${jobType}`);
    }

    return this.queues.get(jobType)!;
  }

  async addJob(jobType: string, data: any, options?: any): Promise<void> {
    const queue = this.getQueue(jobType);
    await queue.add(data, options);
    console.log(`✅ Job added to queue: ${jobType}`);
  }

  async processJobs(handler: (job: JobData) => Promise<void>): Promise<void> {
    const jobTypes = ['email', 'order', 'payment'];
    const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5');

    for (const jobType of jobTypes) {
      const queue = this.getQueue(jobType);

      queue.process(concurrency, async (bullJob) => {
        console.log(`⚙️  Processing job ${bullJob.id} of type ${jobType}`);

        const job: JobData = {
          type: jobType as 'email' | 'order' | 'payment',
          payload: bullJob.data,
        };

        await handler(job);
        console.log(`✅ Job ${bullJob.id} completed`);
      });

      queue.on('failed', (job, err) => {
        console.error(`❌ Job ${job.id} failed:`, err.message);
      });

      console.log(`👂 Listening for ${jobType} jobs (concurrency: ${concurrency})`);
    }
  }

  async getQueueStats() {
    const stats = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    };

    for (const queue of this.queues.values()) {
      const counts = await queue.getJobCounts();
      stats.waiting += counts.waiting || 0;
      stats.active += counts.active || 0;
      stats.completed += counts.completed || 0;
      stats.failed += counts.failed || 0;
    }

    return stats;
  }

  async close(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      console.log(`🔌 Queue ${name} closed`);
    }
  }
}
