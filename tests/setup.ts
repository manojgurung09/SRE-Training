import dotenv from 'dotenv';
import path from 'path';

// Load test environment (if exists) then fallback to .env
const testEnvPath = path.resolve(process.cwd(), '.env.test');
const envPath = path.resolve(process.cwd(), '.env');

import fs from 'fs';
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}
dotenv.config({ path: envPath });

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
}

