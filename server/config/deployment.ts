import dotenv from 'dotenv';

dotenv.config();

export type DeploymentMode = 'single-vm' | 'multi-tier' | 'kubernetes';
export type SecretsProvider = 'env' | 'oci-vault' | 'aws-secrets' | 'azure-keyvault';
export type ConfigProvider = 'env' | 'oci-app-config' | 'aws-appconfig';
export type DatabaseType = 'supabase' | 'postgresql' | 'oci-autonomous' | 'mysql';
export type WorkerMode = 'in-process' | 'bull-queue' | 'oci-queue' | 'sqs' | 'none';
export type CacheType = 'memory' | 'redis' | 'oci-cache' | 'memcached';

interface DeploymentConfig {
  mode: DeploymentMode;
  secretsProvider: SecretsProvider;
  configProvider: ConfigProvider;
  databaseType: DatabaseType;
  workerMode: WorkerMode;
  cacheType: CacheType;
}

export const deploymentConfig: DeploymentConfig = {
  mode: (process.env.DEPLOYMENT_MODE || 'single-vm') as DeploymentMode,
  secretsProvider: (process.env.SECRETS_PROVIDER || 'env') as SecretsProvider,
  configProvider: (process.env.CONFIG_PROVIDER || 'env') as ConfigProvider,
  databaseType: (process.env.DATABASE_TYPE || 'supabase') as DatabaseType,
  workerMode: (process.env.WORKER_MODE || 'in-process') as WorkerMode,
  cacheType: (process.env.CACHE_TYPE || 'memory') as CacheType,
};

export function isSingleVM(): boolean {
  return deploymentConfig.mode === 'single-vm';
}

export function isMultiTier(): boolean {
  return deploymentConfig.mode === 'multi-tier';
}

export function isKubernetes(): boolean {
  return deploymentConfig.mode === 'kubernetes';
}

export function shouldUseWorkers(): boolean {
  return deploymentConfig.workerMode !== 'none' && deploymentConfig.workerMode !== 'in-process';
}

export function shouldUseExternalCache(): boolean {
  return deploymentConfig.cacheType !== 'memory';
}

console.log('🚀 Deployment Configuration:', {
  mode: deploymentConfig.mode,
  database: deploymentConfig.databaseType,
  workers: deploymentConfig.workerMode,
  cache: deploymentConfig.cacheType,
  secrets: deploymentConfig.secretsProvider,
});
