import { supabase } from '../config/supabase';

export class PaymentService {
  /**
   * Lấy thanh toán theo order ID
   */
  static async getByOrderId(storeId: string, orderId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders!inner(store_id)')
      .eq('orders.store_id', storeId)
      .eq('order_id', orderId);

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Lấy danh sách thanh toán gần đây
   */
  static async getRecent(storeId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders!inner(order_number, store_id)')
      .eq('orders.store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data;
  }
}
