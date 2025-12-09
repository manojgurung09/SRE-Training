import { deploymentConfig } from '../../config/deployment';
import { InProcessWorker } from './in-process';
import { BullQueueWorker } from './bull-queue';
import { NoOpWorker } from './noop';

export interface JobData {
  type: 'email' | 'order' | 'payment';
  payload: any;
}

export interface IWorkerAdapter {
  addJob(jobType: string, data: any, options?: any): Promise<void>;
  processJobs(handler: (job: JobData) => Promise<void>): Promise<void>;
  getQueueStats(): Promise<{ waiting: number; active: number; completed: number; failed: number }>;
  close(): Promise<void>;
}

export function createWorkerAdapter(): IWorkerAdapter {
  console.log(`⚡ Initializing ${deploymentConfig.workerMode} worker adapter...`);

  switch (deploymentConfig.workerMode) {
    case 'in-process':
      return new InProcessWorker();
    case 'bull-queue':
      return new BullQueueWorker();
    case 'none':
      return new NoOpWorker();
    default:
      console.warn(`⚠️  Unknown worker mode: ${deploymentConfig.workerMode}, using in-process`);
      return new InProcessWorker();
  }
}

export const workerAdapter = createWorkerAdapter();
