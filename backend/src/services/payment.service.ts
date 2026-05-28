import { supabase } from '../config/supabase';

export class PaymentService {
  /**
   * Lấy thanh toán theo order ID
   */
  static async getByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Lấy danh sách thanh toán gần đây
   */
  static async getRecent(limit: number = 50) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(order_number)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data;
  }
}
