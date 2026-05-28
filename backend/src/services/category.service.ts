import { supabase } from '../config/supabase';

export class CategoryService {
  static async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  static async create(input: { name: string; description?: string; image_url?: string }) {
    const { data, error } = await supabase
      .from('categories')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, input: { name?: string; description?: string; image_url?: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
