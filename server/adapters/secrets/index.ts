import { deploymentConfig } from '../../config/deployment';
import { EnvSecretsProvider } from './env';
import { OCIVaultProvider } from './oci-vault';

export interface ISecretsProvider {
  getSecret(name: string): Promise<string | null>;
  getAllSecrets(): Promise<Record<string, string>>;
}

export function createSecretsProvider(): ISecretsProvider {
  switch (deploymentConfig.secretsProvider) {
    case 'oci-vault':
      return new OCIVaultProvider();
    case 'env':
    default:
      return new EnvSecretsProvider();
  }
}

export const secretsProvider = createSecretsProvider();
