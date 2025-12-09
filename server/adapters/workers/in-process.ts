import { IWorkerAdapter, JobData } from './index';

export class InProcessWorker implements IWorkerAdapter {
  private handler: ((job: JobData) => Promise<void>) | null = null;
  private stats = {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
  };

  async addJob(jobType: string, data: any, options?: any): Promise<void> {
    console.log(`🔄 Processing job immediately: ${jobType}`);

    const job: JobData = {
      type: jobType as 'email' | 'order' | 'payment',
      payload: data,
    };

    this.stats.active++;

    try {
      if (this.handler) {
        await this.handler(job);
        this.stats.completed++;
      } else {
        console.log(`⚠️  No handler registered for job: ${jobType}`);
      }
    } catch (error) {
      console.error(`❌ Job failed: ${jobType}`, error);
      this.stats.failed++;
    } finally {
      this.stats.active--;
    }
  }

  async processJobs(handler: (job: JobData) => Promise<void>): Promise<void> {
    this.handler = handler;
    console.log('✅ In-process worker ready (jobs execute immediately)');
  }

  async getQueueStats() {
    return this.stats;
  }

  async close(): Promise<void> {
    console.log('🔌 In-process worker closed');
  }
}
