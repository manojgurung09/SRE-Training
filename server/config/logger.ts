import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Get log file path from env or use default - use absolute path
const logFile = process.env.LOG_FILE 
  ? path.resolve(process.env.LOG_FILE)
  : path.resolve(process.cwd(), 'logs', 'api.log');
const logDir = path.dirname(logFile);

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
      })
    ),
  }),
];

// Add file transport if LOG_FILE is set
if (logFile) {
  const fileTransport = new winston.transports.File({
    filename: logFile,
    format: logFormat,
  });

  // Add error handler
  fileTransport.on('error', (error) => {
    console.error('Winston file transport error:', error);
  });

  transports.push(fileTransport);
  console.log(`✅ Log file configured: ${logFile}`);
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'sre-training-platform',
    environment: process.env.NODE_ENV || 'development',
  },
  transports,
  // Handle errors
  exceptionHandlers: transports,
  rejectionHandlers: transports,
});

// VERIFY LOGGER WORKS - Test immediately
console.log('🔍 Testing logger...');
logger.info('Logger initialized successfully');
console.log(`🔍 Logger transports: ${logger.transports.length}`);
logger.transports.forEach((transport, index) => {
  console.log(`  Transport ${index}: ${transport.constructor.name}`);
});

export function logBusinessEvent(event: {
  type: string;
  action: string;
  metadata?: Record<string, any>;
}) {
  logger.info('Business Event', {
    event_type: event.type,
    action: event.action,
    ...event.metadata,
  });
}
