#!/usr/bin/env node

/**
 * SRE End-to-End Validation Script (Cross-platform)
 * This script runs all E2E tests and provides a release gate decision
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==========================================');
console.log('SRE E2E Validation Framework');
console.log('==========================================');
console.log('');

// Check if Node.js is available
try {
  execSync('node --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Node.js is not installed');
  process.exit(1);
}

// Check if npm is available
try {
  execSync('npm --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ npm is not installed');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  Warning: .env file not found');
  console.warn('   Some tests may fail without proper environment configuration');
}

console.log('Running E2E test suite...');
console.log('');

try {
  // Run Jest tests
  execSync('npm test -- --testPathPattern=e2e --verbose', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('');
  console.log('==========================================');
  console.log('✅ SAFE TO DEPLOY');
  console.log('');
  console.log('All E2E tests passed successfully.');
  console.log('The system is ready for production deployment.');
  process.exit(0);
} catch (error) {
  console.log('');
  console.log('==========================================');
  console.log('❌ BLOCK RELEASE');
  console.log('');
  console.log('One or more E2E tests failed.');
  console.log('Please fix the issues before deploying to production.');
  process.exit(1);
}

