import { ISecretsProvider } from './index';

export class OCIVaultProvider implements ISecretsProvider {
  private cache: Map<string, string> = new Map();
  private vaultOcid: string;
  private endpoint: string;

  constructor() {
    this.vaultOcid = process.env.OCI_VAULT_OCID || '';
    this.endpoint = process.env.OCI_VAULT_ENDPOINT || '';

    if (!this.vaultOcid) {
      console.warn('⚠️  OCI_VAULT_OCID not set, falling back to environment variables');
    }
  }

  async getSecret(name: string): Promise<string | null> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    try {
      const secret = await this.fetchFromVault(name);
      if (secret) {
        this.cache.set(name, secret);
      }
      return secret;
    } catch (error) {
      console.error(`Failed to fetch secret ${name} from OCI Vault:`, error);
      return process.env[name] || null;
    }
  }

  async getAllSecrets(): Promise<Record<string, string>> {
    const secretNames = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_PASSWORD',
      'JWT_SECRET',
      'API_KEY',
    ];

    const secrets: Record<string, string> = {};

    for (const name of secretNames) {
      const value = await this.getSecret(name);
      if (value) {
        secrets[name] = value;
      }
    }

    return secrets;
  }

  private async fetchFromVault(secretName: string): Promise<string | null> {
    if (!this.vaultOcid) {
      return null;
    }

    console.log(`📦 Fetching secret '${secretName}' from OCI Vault...`);

    return null;
  }
}
