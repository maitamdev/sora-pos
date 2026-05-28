import { supabase } from '../config/supabase';

export class SupplierService {
  static async getAll(storeId: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  static async getById(storeId: string, id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('store_id', storeId)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  static async create(storeId: string, input: { name: string; contact_person?: string; email?: string; phone?: string; address?: string; tax_code?: string }) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...input, store_id: storeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(storeId: string, id: string, input: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(input)
      .eq('store_id', storeId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(storeId: string, id: string) {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('store_id', storeId)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
