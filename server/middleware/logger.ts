import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

let isColdStart = true;

export function logApiEvent(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // IMMEDIATE DEBUG LOG - This will always appear
  console.log(`📝 [LOGGER] Request received: ${req.method} ${req.path}`);

  const requestSize = req.headers['content-length'] 
    ? parseInt(req.headers['content-length'], 10) 
    : JSON.stringify(req.body || {}).length;

  // IMMEDIATE LOG - Log right away, don't wait for finish
  try {
    logger.info('API Request Started', {
      method: req.method,
      path: req.path,
      user_agent: req.get('user-agent'),
      ip: req.ip,
      eventType: 'api_request_start',
      requestSize,
      coldStart: isColdStart,
    });
  } catch (error) {
    console.error('❌ Error in immediate logger.info:', error);
  }

  if (isColdStart) {
    isColdStart = false;
  }

  // Attach finish/close handlers IMMEDIATELY, before next()
  const logRequestComplete = () => {
    const responseTime = Date.now() - startTime;
    const responseSize = res.get('content-length') 
      ? parseInt(res.get('content-length') || '0', 10)
      : 0;

    console.log(`📝 [LOGGER] Response finished: ${req.method} ${req.path} - Status: ${res.statusCode || 200} - Time: ${responseTime}ms`);

    try {
      logger.info('API Request', {
        method: req.method,
        path: req.path,
        status_code: res.statusCode || 200,
        response_time_ms: responseTime,
        user_agent: req.get('user-agent'),
        ip: req.ip,
        eventType: 'api_request',
        requestSize,
        responseSize,
        coldStart: false,
      });
    } catch (error) {
      console.error('❌ Error in logger.info (finish):', error);
    }

    // Database logging (async, fire and forget)
    (async () => {
      try {
        await supabase.from('api_events').insert({
          event_type: 'api_request',
          endpoint: req.path,
          method: req.method,
          status_code: res.statusCode || 200,
          response_time_ms: responseTime,
          error_message: res.statusCode >= 400 ? res.statusMessage : null,
        });
      } catch (error) {
        // Silently fail database logging
      }
    })();
  };

  // Attach BOTH listeners immediately
  res.once('finish', logRequestComplete);
  res.once('close', logRequestComplete);

  // Call next() to continue
  next();
}
