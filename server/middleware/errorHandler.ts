import { Request, Response, NextFunction } from 'express';
import { errorTotal } from '../config/metrics';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  if (statusCode >= 500) {
    errorTotal.inc({
      error_type: err.name || 'Error',
      endpoint: req.path,
    });
  }

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal server error',
      status: statusCode,
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
}
