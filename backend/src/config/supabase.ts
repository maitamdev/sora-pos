import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Lazy initialization - chỉ tạo client khi cần, tránh crash nếu chưa có config
let _supabase: SupabaseClient | null = null;
let _supabaseAnon: SupabaseClient | null = null;

/**
 * Supabase client với service role key (full access, dùng cho backend)
 * Sẽ throw error nếu chưa cấu hình SUPABASE_URL
 */
export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      throw new Error('SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. Kiểm tra file .env');
    }
    _supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  }
  return _supabase;
};

/**
 * Shorthand - tương thích với code cũ
 * Dùng Proxy để lazy load
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});

/**
 * Supabase client với anon key (restricted access)
 */
export const getSupabaseAnon = (): SupabaseClient => {
  if (!_supabaseAnon) {
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      throw new Error('SUPABASE_URL và SUPABASE_ANON_KEY chưa được cấu hình');
    }
    _supabaseAnon = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return _supabaseAnon;
};
