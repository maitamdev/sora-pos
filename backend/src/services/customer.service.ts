import { supabase } from '../config/supabase';

export class CustomerService {
  static async getAll(search?: string) {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  static async create(input: { name: string; email?: string; phone?: string; address?: string }) {
    const { data, error } = await supabase
      .from('customers')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, input: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('customers')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
