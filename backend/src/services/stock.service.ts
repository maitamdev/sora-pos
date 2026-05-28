import { supabase } from '../config/supabase';
import { StockImportInput, StockAdjustmentInput } from '../types/stock.type';

export class StockService {
  /**
   * Nhập kho - tăng stock_quantity và ghi transaction
   */
  static async importStock(storeId: string, input: StockImportInput, userId: string) {
    // 1. Lấy thông tin sản phẩm hiện tại
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_level')
      .eq('store_id', storeId)
      .eq('id', input.product_id)
      .single();

    if (productError || !product) {
      throw new Error('Sản phẩm không tồn tại hoặc không thuộc cửa hàng này');
    }

    const previousStock = product.stock_quantity;
    const newStock = previousStock + input.quantity;

    // 2. Cập nhật stock_quantity
    await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('store_id', storeId)
      .eq('id', input.product_id);

    // 3. Ghi stock_transaction
    const { data: transaction, error: transError } = await supabase
      .from('stock_transactions')
      .insert({
        product_id: input.product_id,
        type: 'import',
        quantity: input.quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        note: input.note || 'Nhập kho',
        user_id: userId,
      })
      .select()
      .single();

    if (transError) throw new Error(transError.message);

    // 4. Kiểm tra và resolve stock_alert nếu đủ hàng
    if (newStock > product.min_stock_level) {
      await supabase
        .from('stock_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
        })
        .eq('product_id', input.product_id)
        .neq('status', 'resolved');
    }

    return transaction;
  }

  /**
   * Điều chỉnh tồn kho - set stock_quantity trực tiếp
   */
  static async adjustStock(storeId: string, input: StockAdjustmentInput, userId: string) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_level')
      .eq('store_id', storeId)
      .eq('id', input.product_id)
      .single();

    if (productError || !product) {
      throw new Error('Sản phẩm không tồn tại hoặc không thuộc cửa hàng này');
    }

    const previousStock = product.stock_quantity;
    const quantityDiff = input.new_quantity - previousStock;

    // Cập nhật stock
    await supabase
      .from('products')
      .update({ stock_quantity: input.new_quantity })
      .eq('store_id', storeId)
      .eq('id', input.product_id);

    // Ghi transaction
    const { data: transaction, error: transError } = await supabase
      .from('stock_transactions')
      .insert({
        product_id: input.product_id,
        type: 'adjustment',
        quantity: quantityDiff,
        previous_stock: previousStock,
        new_stock: input.new_quantity,
        note: input.reason,
        user_id: userId,
      })
      .select()
      .single();

    if (transError) throw new Error(transError.message);

    // Kiểm tra cảnh báo tồn kho
    if (input.new_quantity <= product.min_stock_level) {
      const alertStatus = input.new_quantity === 0 ? 'out_of_stock' : 'low_stock';

      const { data: existingAlert } = await supabase
        .from('stock_alerts')
        .select('id')
        .eq('product_id', input.product_id)
        .neq('status', 'resolved')
        .single();

      if (existingAlert) {
        await supabase
          .from('stock_alerts')
          .update({ current_stock: input.new_quantity, status: alertStatus })
          .eq('id', existingAlert.id);
      } else {
        await supabase.from('stock_alerts').insert({
          product_id: input.product_id,
          current_stock: input.new_quantity,
          min_stock_level: product.min_stock_level,
          status: alertStatus,
        });
      }
    } else {
      // Resolve nếu đủ hàng
      await supabase
        .from('stock_alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: userId })
        .eq('product_id', input.product_id)
        .neq('status', 'resolved');
    }

    return transaction;
  }

  /**
   * Lấy danh sách cảnh báo tồn kho thấp
   */
  static async getAlerts(storeId: string) {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('*, products!inner(name, sku, stock_quantity, min_stock_level, unit, store_id)')
      .eq('products.store_id', storeId)
      .neq('status', 'resolved')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Lấy lịch sử giao dịch kho
   */
  static async getTransactions(storeId: string, productId?: string, page: number = 1, limit: number = 50) {
    let query = supabase
      .from('stock_transactions')
      .select('*, products!inner(name, sku, store_id), users(full_name)', { count: 'exact' })
      .eq('products.store_id', storeId)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return { transactions: data, total: count || 0, page, limit };
  }
}
