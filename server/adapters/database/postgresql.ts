import { IDatabaseAdapter, QueryResult, SelectOptions } from './index';

export class PostgreSQLAdapter implements IDatabaseAdapter {
  private connectionString: string;

  constructor() {
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = process.env.POSTGRES_PORT || '5432';
    const database = process.env.POSTGRES_DB || 'bharatmart';
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || '';
    const ssl = process.env.POSTGRES_SSL === 'true' ? '?sslmode=require' : '';

    this.connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}${ssl}`;
  }

  async initialize(): Promise<void> {
    console.log('✅ PostgreSQL adapter initialized');
    console.log(`📍 Connection: ${this.connectionString.replace(/:[^:@]+@/, ':****@')}`);
  }

  async close(): Promise<void> {
    console.log('🔌 PostgreSQL connection closed');
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    console.log('📊 PostgreSQL query:', sql);
    return { data: null, error: new Error('PostgreSQL adapter not fully implemented - install pg package') };
  }

  async insert<T = any>(table: string, data: Record<string, any>): Promise<QueryResult<T>> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    return this.query<T>(sql, values);
  }

  async update<T = any>(table: string, id: string, data: Record<string, any>): Promise<QueryResult<T>> {
    const updates = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(data), id];

    const sql = `UPDATE ${table} SET ${updates} WHERE id = $${values.length} RETURNING *`;
    return this.query<T>(sql, values);
  }

  async delete(table: string, id: string): Promise<QueryResult> {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    return this.query(sql, [id]);
  }

  async select<T = any>(table: string, options: SelectOptions = {}): Promise<QueryResult<T>> {
    const columns = options.columns?.join(', ') || '*';
    let sql = `SELECT ${columns} FROM ${table}`;
    const params: any[] = [];

    if (options.where) {
      const conditions = Object.entries(options.where).map(([key, value], i) => {
        params.push(value);
        return `${key} = $${i + 1}`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy.column} ${options.orderBy.ascending ? 'ASC' : 'DESC'}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    if (options.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    return this.query<T>(sql, params);
  }
}
