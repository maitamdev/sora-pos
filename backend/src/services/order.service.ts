import { supabase } from '../config/supabase';
import { CreateOrderInput, OrderResult } from '../types/order.type';
import { generateOrderNumber } from '../utils/calculate';

export class OrderService {
  /**
   * ===== LUỒNG TẠO HÓA ĐƠN =====
   *
   * 1. Kiểm tra từng sản phẩm có đủ tồn kho không
   * 2. Nếu không đủ → trả lỗi, chỉ rõ sản phẩm nào thiếu
   * 3. Tính total_amount, discount_amount, final_amount
   * 4. Tạo order trong bảng orders
   * 5. Tạo order_details cho từng sản phẩm
   * 6. Trừ stock_quantity của từng sản phẩm
   * 7. Ghi stock_transactions loại 'sale'
   * 8. Kiểm tra stock_quantity <= min_stock_level → tạo/cập nhật stock_alert
   * 9. Tạo payment
   * 10. Trả kết quả order đầy đủ
   */
  static async createOrder(input: CreateOrderInput, userId: string): Promise<OrderResult> {
    // ===== BƯỚC 1: Kiểm tra tồn kho =====
    const productIds = input.items.map((item) => item.product_id);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_level, sell_price')
      .in('id', productIds);

    if (productError || !products) {
      throw new Error('Không thể kiểm tra sản phẩm');
    }

    // Kiểm tra từng sản phẩm có đủ tồn kho
    const insufficientStock: string[] = [];
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        insufficientStock.push(`Sản phẩm ${item.product_id} không tồn tại`);
        continue;
      }
      if (product.stock_quantity < item.quantity) {
        insufficientStock.push(
          `${product.name}: yêu cầu ${item.quantity}, tồn kho ${product.stock_quantity}`
        );
      }
    }

    if (insufficientStock.length > 0) {
      throw new Error(`Không đủ tồn kho:\n${insufficientStock.join('\n')}`);
    }

    // ===== BƯỚC 2: Tính tiền =====
    let totalAmount = 0;
    const orderDetails = input.items.map((item) => {
      const subtotal = item.quantity * item.unit_price - (item.discount || 0);
      totalAmount += subtotal;
      return {
        product_id: item.product_id,
        product_name: products.find((p) => p.id === item.product_id)?.name || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        subtotal,
      };
    });

    const discountAmount = input.discount_amount || 0;
    const finalAmount = totalAmount - discountAmount;

    // ===== BƯỚC 3: Tạo order =====
    // TODO: Lấy sequence number trong ngày để tạo order_number chính xác
    const orderNumber = generateOrderNumber(Date.now() % 1000);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: input.customer_id || null,
        user_id: userId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        status: 'completed',
        payment_status: 'paid',
        note: input.note || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error('Không thể tạo hóa đơn');
    }

    // ===== BƯỚC 4: Tạo order_details =====
    const detailsWithOrderId = orderDetails.map((d) => ({
      ...d,
      order_id: order.id,
    }));

    const { data: details, error: detailsError } = await supabase
      .from('order_details')
      .insert(detailsWithOrderId)
      .select();

    if (detailsError) {
      throw new Error('Không thể tạo chi tiết hóa đơn');
    }

    // ===== BƯỚC 5: Trừ kho & ghi transaction =====
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.product_id)!;
      const previousStock = product.stock_quantity;
      const newStock = previousStock - item.quantity;

      // Trừ stock_quantity
      await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id);

      // Ghi stock_transaction loại 'sale'
      await supabase.from('stock_transactions').insert({
        product_id: item.product_id,
        type: 'sale',
        quantity: -item.quantity, // Âm vì là xuất kho
        previous_stock: previousStock,
        new_stock: newStock,
        reference_id: order.id,
        note: `Bán hàng - HĐ ${orderNumber}`,
        user_id: userId,
      });

      // ===== BƯỚC 6: Kiểm tra cảnh báo tồn kho =====
      if (newStock <= product.min_stock_level) {
        const alertStatus = newStock === 0 ? 'out_of_stock' : 'low_stock';

        // Kiểm tra đã có alert chưa
        const { data: existingAlert } = await supabase
          .from('stock_alerts')
          .select('id')
          .eq('product_id', item.product_id)
          .neq('status', 'resolved')
          .single();

        if (existingAlert) {
          // Cập nhật alert hiện tại
          await supabase
            .from('stock_alerts')
            .update({
              current_stock: newStock,
              status: alertStatus,
            })
            .eq('id', existingAlert.id);
        } else {
          // Tạo alert mới
          await supabase.from('stock_alerts').insert({
            product_id: item.product_id,
            current_stock: newStock,
            min_stock_level: product.min_stock_level,
            status: alertStatus,
          });
        }
      }
    }

    // ===== BƯỚC 7: Tạo payment =====
    const changeAmount = input.received_amount - finalAmount;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        method: input.payment_method,
        amount: finalAmount,
        received_amount: input.received_amount,
        change_amount: changeAmount > 0 ? changeAmount : 0,
        status: 'completed',
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error('Không thể tạo thanh toán');
    }

    // ===== BƯỚC 8: Cập nhật tổng chi tiêu khách hàng =====
    if (input.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('total_spent, points')
        .eq('id', input.customer_id)
        .single();

      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_spent: (customer.total_spent || 0) + finalAmount,
            points: (customer.points || 0) + Math.floor(finalAmount / 10000), // 1 điểm per 10k
          })
          .eq('id', input.customer_id);
      }
    }

    return {
      order,
      order_details: details || [],
      payment,
    };
  }

  /**
   * Lấy danh sách hóa đơn (có phân trang)
   */
  static async getAll(page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select('*, customers(name), users(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      orders: data,
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Lấy chi tiết hóa đơn
   */
  static async getById(id: string) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, customers(name), users(full_name)')
      .eq('id', id)
      .single();

    if (error || !order) return null;

    const { data: details } = await supabase
      .from('order_details')
      .select('*')
      .eq('order_id', id);

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', id)
      .single();

    return { order, order_details: details || [], payment };
  }
}
