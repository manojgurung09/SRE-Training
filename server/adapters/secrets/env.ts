import { ISecretsProvider } from './index';

export class EnvSecretsProvider implements ISecretsProvider {
  async getSecret(name: string): Promise<string | null> {
    return process.env[name] || null;
  }

  async getAllSecrets(): Promise<Record<string, string>> {
    return { ...process.env } as Record<string, string>;
  }
}
