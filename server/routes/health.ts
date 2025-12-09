import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/health
// Health check endpoint (liveness probe)
// Returns basic health status with database connectivity check
router.get('/health', async (_req, res) => {
  try {
    const startTime = Date.now();
    
    // ✅ Directly run the actual health check query (no debug RPC)
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      console.error('❌ Health check products query failed:', error);

      return res.status(500).json({
        ok: false,
        count: 0
      });
    }

    // ✅ If everything is fine
    return res.status(200).json({
      ok: true,
      count: data?.length ?? 0
    });

  } catch (err) {
    console.error('❌ Unexpected health error:', err);

    return res.status(500).json({
      ok: false,
      count: 0
    });
  }
});


router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('products').select('id').limit(1);
    const responseTime = Date.now() - startTime;

    if (error) throw error;

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'ok',
          responseTimeMs: responseTime
        },
        service: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'failed',
          error: (error as Error).message
        },
        service: 'ok',
      },
    });
  }
});

export default router;
