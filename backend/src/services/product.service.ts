import { supabase } from '../config/supabase';
import { Product, CreateProductInput, UpdateProductInput } from '../types/product.type';

export class ProductService {
  /**
   * Lấy danh sách sản phẩm (có phân trang)
   */
  static async getAll(page: number = 1, limit: number = 20, search?: string) {
    let query = supabase
      .from('products')
      .select('*, categories(name), suppliers(name)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Tìm kiếm theo tên hoặc SKU
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Phân trang
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      products: data as Product[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Lấy sản phẩm theo ID
   */
  static async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), suppliers(name)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Product;
  }

  /**
   * Tạo sản phẩm mới
   */
  static async create(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Product;
  }

  /**
   * Cập nhật sản phẩm
   */
  static async update(id: string, input: UpdateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Product;
  }

  /**
   * Xóa sản phẩm (soft delete)
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
