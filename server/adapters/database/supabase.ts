import { IDatabaseAdapter, QueryResult, SelectOptions } from './index';
import { supabase } from '../../config/supabase';

export class SupabaseAdapter implements IDatabaseAdapter {
  async initialize(): Promise<void> {
    console.log('✅ Supabase adapter initialized');
  }

  async close(): Promise<void> {
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      const { data, error } = await supabase.rpc('execute_sql', { query: sql, params });
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async insert<T = any>(table: string, data: Record<string, any>): Promise<QueryResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .maybeSingle();

    return { data: result ? [result] : null, error };
  }

  async update<T = any>(table: string, id: string, data: Record<string, any>): Promise<QueryResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle();

    return { data: result ? [result] : null, error };
  }

  async delete(table: string, id: string): Promise<QueryResult> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async select<T = any>(table: string, options: SelectOptions = {}): Promise<QueryResult<T>> {
    let query = supabase.from(table).select(options.columns?.join(',') || '*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    return { data: data as T[] | null, error, count: count || undefined };
  }
}
