import { supabase } from '../config/supabase';

export class SupplierService {
  static async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  static async create(input: { name: string; contact_person?: string; email?: string; phone?: string; address?: string; tax_code?: string }) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, input: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
