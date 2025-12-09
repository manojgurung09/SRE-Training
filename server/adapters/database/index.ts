import { deploymentConfig } from '../../config/deployment';
import { SupabaseAdapter } from './supabase';
import { PostgreSQLAdapter } from './postgresql';
import { OCIAutonomousAdapter } from './oci-autonomous';

export interface QueryResult<T = any> {
  data: T[] | null;
  error: Error | null;
  count?: number;
}

export interface IDatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  insert<T = any>(table: string, data: Record<string, any>): Promise<QueryResult<T>>;
  update<T = any>(table: string, id: string, data: Record<string, any>): Promise<QueryResult<T>>;
  delete(table: string, id: string): Promise<QueryResult>;
  select<T = any>(table: string, options?: SelectOptions): Promise<QueryResult<T>>;
  initialize(): Promise<void>;
  close(): Promise<void>;
}

export interface SelectOptions {
  columns?: string[];
  where?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export function createDatabaseAdapter(): IDatabaseAdapter {
  console.log(`📊 Initializing ${deploymentConfig.databaseType} database adapter...`);

  switch (deploymentConfig.databaseType) {
    case 'supabase':
      return new SupabaseAdapter();
    case 'postgresql':
      return new PostgreSQLAdapter();
    case 'oci-autonomous':
      return new OCIAutonomousAdapter();
    default:
      throw new Error(`Unsupported database type: ${deploymentConfig.databaseType}. Supported types: supabase, postgresql, oci-autonomous, mysql`);
  }
}

export const database = createDatabaseAdapter();
