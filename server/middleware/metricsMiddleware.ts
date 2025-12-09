import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal, chaosEventsTotal, simulatedLatencyMs } from '../config/metrics';

export async function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  const chaosEnabled = process.env.CHAOS_ENABLED === 'true';
  const chaosLatencyMs = parseInt(process.env.CHAOS_LATENCY_MS || '0', 10);

  if (chaosEnabled && Math.random() < 0.1) {
    chaosEventsTotal.inc();
  }

  if (chaosLatencyMs > 0) {
    simulatedLatencyMs.set(chaosLatencyMs);
    await new Promise(resolve => setTimeout(resolve, chaosLatencyMs));
  }

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const statusCode = res.statusCode.toString();

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });
  });

  next();
}
