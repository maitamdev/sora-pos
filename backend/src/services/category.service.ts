import { supabase } from '../config/supabase';

export class CategoryService {
  static async getAll(storeId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  static async getById(storeId: string, id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  static async create(storeId: string, input: { name: string; description?: string; image_url?: string }) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...input, store_id: storeId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(storeId: string, id: string, input: { name?: string; description?: string; image_url?: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('categories')
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
      .from('categories')
      .update({ is_active: false })
      .eq('store_id', storeId)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
