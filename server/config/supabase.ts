import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { externalCallLatencyMs } from './metrics';

// ✅ Load env file based on environment
const envFile = '.env';

dotenv.config({ path: envFile });

console.log('  process.env.ENV_FILE:', process.env.ENV_FILE);
console.log('  process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('  ENV FILE:', envFile);

console.log('  ENV FILE:', envFile);

// ✅ Strict backend-only configuration (NO fallbacks to anon or VITE)
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 🚨 Fail fast if misconfigured
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase backend configuration error');
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

// 🚨 Extra hard validation: ensure this is REALLY a service-role JWT
if (!serviceRoleKey.startsWith('eyJhbGciOi')) {
  console.error('❌ INVALID SUPABASE SERVICE ROLE KEY FORMAT');
  console.error('Loaded key does not look like a JWT.');
  console.error('You may be accidentally using ANON or a wrong secret.');
  process.exit(1);
}

// ✅ Safe debug logging (no secrets leaked)
console.log('Supabase Backend Config:');
console.log('  ENV FILE:', envFile);
console.log('  URL:', supabaseUrl);
console.log('  Using SERVICE_ROLE_KEY: true');

// ✅ Backend client using SERVICE ROLE only
const supabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Wrap supabase client to time all operations
export const supabase = new Proxy(supabaseClient, {
  get(target, prop) {
    const value = target[prop as keyof typeof target];
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value as any, {
        get(innerTarget: any, innerProp: string | symbol) {
          const innerValue = innerTarget[innerProp];
          if (typeof innerValue === 'function') {
            return function(...args: any[]) {
              const startTime = Date.now();
              const result = (innerValue as Function).apply(innerTarget, args);
              if (result && typeof result.then === 'function') {
                return result.then((res: any) => {
                  const duration = Date.now() - startTime;
                  externalCallLatencyMs.observe({ dependency: 'supabase' }, duration);
                  return res;
                }).catch((err: any) => {
                  const duration = Date.now() - startTime;
                  externalCallLatencyMs.observe({ dependency: 'supabase' }, duration);
                  throw err;
                });
              }
              const duration = Date.now() - startTime;
              externalCallLatencyMs.observe({ dependency: 'supabase' }, duration);
              return result;
            };
          }
          return innerValue;
        }
      });
    }
    return value;
  }
});
