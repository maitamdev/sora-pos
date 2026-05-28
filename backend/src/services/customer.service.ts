import { supabase } from '../config/supabase';

export class CustomerService {
  static async getAll(storeId: string, search?: string) {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  static async getById(storeId: string, id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  static async create(storeId: string, input: { name: string; email?: string; phone?: string; address?: string }) {
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...input, store_id: storeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(storeId: string, id: string, input: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('customers')
      .update(input)
      .eq('store_id', storeId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
