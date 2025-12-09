import { IWorkerAdapter, JobData } from './index';

export class NoOpWorker implements IWorkerAdapter {
  async addJob(jobType: string, data: any): Promise<void> {
    console.log(`⏭️  Job skipped (workers disabled): ${jobType}`);
  }

  async processJobs(handler: (job: JobData) => Promise<void>): Promise<void> {
    console.log('⏸️  Worker processing disabled');
  }

  async getQueueStats() {
    return { waiting: 0, active: 0, completed: 0, failed: 0 };
  }

  async close(): Promise<void> {
  }
}
