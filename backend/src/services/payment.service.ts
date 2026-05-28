import { supabase } from '../config/supabase';
import { PaymentMethod } from '../types/order.type';

export class PaymentService {
  static async create(input: {
    order_id: string;
    method: PaymentMethod;
    amount: number;
    received_amount: number;
    change_amount: number;
    reference_code?: string;
  }) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: input.order_id,
        method: input.method,
        amount: input.amount,
        received_amount: input.received_amount,
        change_amount: input.change_amount,
        reference_code: input.reference_code || null,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

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
