import { Router, Request, Response } from 'express';
import { queueService } from '../config/queue';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await queueService.getQueueStats();

    res.json({
      timestamp: new Date().toISOString(),
      queues: stats,
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ error: 'Failed to fetch queue statistics' });
  }
});

export default router;
