import { supabase } from '../config/supabase';
import { CreateSupplierInput, UpdateSupplierInput, SupplierFilters } from '../types/supplier.type';

export class SupplierService {
  static async getAll(storeId: string, filters: SupplierFilters = {}) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const status = filters.status || 'active';

    let query = supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
      .eq('store_id', storeId)
      .order('name', { ascending: true });

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim().replace(/[%_,]/g, '\\$&');
      query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      suppliers: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.max(Math.ceil((count || 0) / limit), 1),
    };
  }

  static async getById(storeId: string, id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('store_id', storeId)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  }

  static async create(storeId: string, input: CreateSupplierInput) {
    const payload = {
      name: input.name?.trim(),
      contact_person: input.contact_person?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      tax_code: input.tax_code?.trim() || null,
      store_id: storeId,
    };

    const { data, error } = await supabase
      .from('suppliers')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(storeId: string, id: string, input: UpdateSupplierInput) {
    const payload: any = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.contact_person !== undefined) payload.contact_person = input.contact_person.trim() || null;
    if (input.email !== undefined) payload.email = input.email.trim() || null;
    if (input.phone !== undefined) payload.phone = input.phone.trim() || null;
    if (input.address !== undefined) payload.address = input.address.trim() || null;
    if (input.tax_code !== undefined) payload.tax_code = input.tax_code.trim() || null;
    if (input.is_active !== undefined) payload.is_active = input.is_active;

    const { data, error } = await supabase
      .from('suppliers')
      .update(payload)
      .eq('store_id', storeId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(storeId: string, id: string) {
    // Soft delete to preserve product relationship references
    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('store_id', storeId)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
