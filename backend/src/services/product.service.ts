import { supabase } from '../config/supabase';
import { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '../types/product.type';
import { generateProductQR } from '../utils/qr';

const productSelect = '*, categories(name), suppliers(name)';

const normalizeProduct = (product: Product): Product => ({
  ...product,
  import_price: Number(product.cost_price ?? 0),
  selling_price: Number(product.sell_price ?? 0),
  cost_price: Number(product.cost_price ?? 0),
  sell_price: Number(product.sell_price ?? 0),
  status: product.is_active ? 'active' : 'inactive',
});

const preparePayload = (input: CreateProductInput | UpdateProductInput) => {
  const { import_price, selling_price, status, ...rest } = input;
  return {
    ...rest,
    ...(import_price !== undefined ? { cost_price: import_price } : {}),
    ...(selling_price !== undefined ? { sell_price: selling_price } : {}),
    ...(status !== undefined ? { is_active: status === 'active' } : {}),
  };
};

export class ProductService {
  static async getAll(storeId: string, filters: ProductFilters = {}) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const categoryId = filters.category_id || filters.category;
    const status = filters.status || 'active';

    let query = supabase
      .from('products')
      .select(productSelect, { count: 'exact' })
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim().replace(/[%_,]/g, '\\$&');
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    if (!filters.lowStock) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    let products = (data || []).map((product) => normalizeProduct(product as Product));
    let total = count || 0;

    if (filters.lowStock) {
      const lowStockProducts = products.filter(
        (product) => product.stock_quantity <= product.min_stock_level
      );
      total = lowStockProducts.length;
      const from = (page - 1) * limit;
      products = lowStockProducts.slice(from, from + limit);
    }

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  }

  static async getById(storeId: string, id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(productSelect)
      .eq('store_id', storeId)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return normalizeProduct(data as Product);
  }

  static async getQrCode(storeId: string, id: string): Promise<string> {
    const product = await this.getById(storeId, id);
    if (!product) throw new Error('Sản phẩm không tồn tại hoặc không thuộc cửa hàng này');
    return generateProductQR({
      sku: product.sku,
      name: product.name,
      sell_price: product.sell_price,
    });
  }

  static async create(storeId: string, input: CreateProductInput): Promise<Product> {
    const payload = preparePayload(input);

    const { data, error } = await supabase
      .from('products')
      .insert({ ...payload, store_id: storeId })
      .select(productSelect)
      .single();

    if (error) throw new Error(error.message);

    const product = normalizeProduct(data as Product);
    await this.syncLowStockAlert(product);
    await generateProductQR({
      sku: product.sku,
      name: product.name,
      sell_price: product.sell_price,
    }).catch(() => undefined);

    return product;
  }

  static async update(storeId: string, id: string, input: UpdateProductInput): Promise<Product> {
    const payload = preparePayload(input);

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('store_id', storeId)
      .eq('id', id)
      .select(productSelect)
      .single();

    if (error) throw new Error(error.message);

    const product = normalizeProduct(data as Product);
    await this.syncLowStockAlert(product);
    return product;
  }

  static async delete(storeId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('store_id', storeId)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private static async syncLowStockAlert(product: Product) {
    if (product.stock_quantity > product.min_stock_level) return;

    const status = product.stock_quantity === 0 ? 'out_of_stock' : 'low_stock';

    const { data: existingAlert } = await supabase
      .from('stock_alerts')
      .select('id')
      .eq('product_id', product.id)
      .neq('status', 'resolved')
      .maybeSingle();

    if (existingAlert) {
      await supabase
        .from('stock_alerts')
        .update({
          current_stock: product.stock_quantity,
          min_stock_level: product.min_stock_level,
          status,
        })
        .eq('id', existingAlert.id);
      return;
    }

    await supabase.from('stock_alerts').insert({
      product_id: product.id,
      current_stock: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      status,
    });
  }
}
