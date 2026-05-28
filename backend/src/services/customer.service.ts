import { supabase } from '../config/supabase';

export class CustomerService {
  static async getAll(storeId: string, search?: string) {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name');

    if (search?.trim()) {
      const term = search.trim().replace(/[%_,]/g, '\\$&');
      query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
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
    const payload = {
      name: input.name?.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
    };

    if (!payload.name) {
      throw new Error('Ten khach hang la bat buoc');
    }

    if (payload.phone) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, name')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .eq('phone', payload.phone)
        .maybeSingle();

      if (existingCustomer) {
        throw new Error(`So dien thoai da dang ky cho khach hang ${existingCustomer.name}`);
      }
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({ ...payload, store_id: storeId })
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
