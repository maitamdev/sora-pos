import { supabase } from '../config/supabase';
import { CreateOrderInput, OrderFilters, OrderResult } from '../types/order.type';
import { generateOrderNumber } from '../utils/calculate';
import { generateInvoicePDF } from '../utils/pdf';
import { PaymentService } from './payment.service';

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  min_stock_level: number;
  sell_price: number;
  is_active: boolean;
}

const normalizePaymentMethod = (method: CreateOrderInput['payment_method']) => {
  if (method === 'transfer') return 'bank_transfer';
  if (method === 'momo' || method === 'zalopay') return 'e_wallet';
  if (method === 'card') return 'bank_transfer';
  return method;
};

export class OrderService {
  /**
   * Supabase JS does not provide a multi-statement transaction wrapper here.
   * For strict atomicity in production, move this workflow into a PostgreSQL RPC
   * that creates order, details, payment, stock transactions and stock alerts in
   * one database transaction.
   */
  static async createOrder(storeId: string, input: CreateOrderInput, userId: string): Promise<OrderResult> {
    if (!userId) throw new Error('Nguoi dung chua dang nhap');
    if (!input.items?.length) throw new Error('Gio hang dang rong');

    const mergedItems = input.items.reduce<Record<string, { product_id: string; quantity: number; discount: number }>>(
      (acc, item) => {
        if (!acc[item.product_id]) {
          acc[item.product_id] = { product_id: item.product_id, quantity: 0, discount: 0 };
        }
        acc[item.product_id].quantity += item.quantity;
        acc[item.product_id].discount += item.discount || 0;
        return acc;
      },
      {}
    );
    const items = Object.values(mergedItems);
    const productIds = items.map((item) => item.product_id);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, min_stock_level, sell_price, is_active')
      .eq('store_id', storeId)
      .in('id', productIds);

    if (productError || !products) {
      throw new Error('Khong the kiem tra san pham');
    }

    if (products.length !== productIds.length) {
      throw new Error('Mot hoac nhieu san pham khong ton tai trong cua hang');
    }

    const insufficientStock: string[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id) as ProductRow | undefined;
      if (!product || !product.is_active) {
        insufficientStock.push(`San pham ${item.product_id} khong kha dung`);
        continue;
      }
      if (product.stock_quantity < item.quantity) {
        insufficientStock.push(`${product.name}: yeu cau ${item.quantity}, ton kho ${product.stock_quantity}`);
      }
    }

    if (insufficientStock.length > 0) {
      throw new Error(`Khong du ton kho: ${insufficientStock.join('; ')}`);
    }

    let totalAmount = 0;
    const orderDetails = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id) as ProductRow;
      const unitPrice = Number(product.sell_price || 0);
      const lineTotal = item.quantity * unitPrice;
      const lineDiscount = Math.min(item.discount || 0, lineTotal);
      const subtotal = lineTotal - lineDiscount;
      totalAmount += subtotal;

      return {
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount: lineDiscount,
        subtotal,
      };
    });

    const discountAmount = Math.min(input.discount_amount || 0, totalAmount);
    const finalAmount = Math.max(totalAmount - discountAmount, 0);
    const paymentMethod = normalizePaymentMethod(input.payment_method);
    const receivedAmount = paymentMethod === 'cash' ? input.received_amount || 0 : finalAmount;

    if (paymentMethod === 'cash' && receivedAmount < finalAmount) {
      throw new Error('So tien khach dua chua du');
    }

    const orderNumber = generateOrderNumber(Date.now() % 1000);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: input.customer_id || null,
        user_id: userId,
        store_id: storeId,
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
      throw new Error(orderError?.message || 'Khong the tao hoa don');
    }

    const { data: details, error: detailsError } = await supabase
      .from('order_details')
      .insert(orderDetails.map((detail) => ({ ...detail, order_id: order.id })))
      .select();

    if (detailsError) {
      throw new Error(detailsError.message || 'Khong the tao chi tiet hoa don');
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id) as ProductRow;
      const previousStock = product.stock_quantity;
      const newStock = previousStock - item.quantity;

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('store_id', storeId)
        .eq('id', item.product_id);

      if (stockError) throw new Error(stockError.message);

      const { error: stockTransactionError } = await supabase.from('stock_transactions').insert({
        product_id: item.product_id,
        type: 'sale',
        quantity: -item.quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        reference_id: order.id,
        note: `Ban hang - HD ${orderNumber}`,
        user_id: userId,
      });

      if (stockTransactionError) throw new Error(stockTransactionError.message);

      await this.syncLowStockAlert(item.product_id, newStock, product.min_stock_level);
    }

    const payment = await PaymentService.create({
      order_id: order.id,
      method: paymentMethod,
      amount: finalAmount,
      received_amount: receivedAmount,
      change_amount: Math.max(receivedAmount - finalAmount, 0),
      reference_code: paymentMethod === 'qr_mock' ? `QRMOCK-${orderNumber}` : undefined,
    });

    if (input.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('total_spent, points')
        .eq('store_id', storeId)
        .eq('id', input.customer_id)
        .single();

      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_spent: Number(customer.total_spent || 0) + finalAmount,
            points: Number(customer.points || 0) + Math.floor(finalAmount / 10000),
          })
          .eq('store_id', storeId)
          .eq('id', input.customer_id);
      }
    }

    return {
      order,
      order_details: details || [],
      payment,
    };
  }

  static async getAll(storeId: string, filters: OrderFilters = {}) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 20, 1), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select('*, customers(id, name, phone), users(id, full_name)', { count: 'exact' })
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (filters.search?.trim()) {
      const search = filters.search.trim().replace(/[%_,]/g, '\\$&');
      query = query.ilike('order_number', `%${search}%`);
    }

    if (filters.date_from) {
      query = query.gte('created_at', new Date(filters.date_from).toISOString());
    }

    if (filters.date_to) {
      const dateTo = new Date(filters.date_to);
      dateTo.setHours(23, 59, 59, 999);
      query = query.lte('created_at', dateTo.toISOString());
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.payment_status && filters.payment_status !== 'all') {
      query = query.eq('payment_status', filters.payment_status);
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      orders: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.max(Math.ceil((count || 0) / limit), 1),
    };
  }

  static async getById(storeId: string, id: string) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, customers(id, name, phone, email, address, points, total_spent), users(id, full_name, email)')
      .eq('store_id', storeId)
      .eq('id', id)
      .single();

    if (error || !order) return null;

    const { data: details } = await supabase
      .from('order_details')
      .select('*, products(id, sku, name, image_url, unit)')
      .eq('order_id', id);

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', id)
      .maybeSingle();

    return { order, order_details: details || [], payment: payment || null };
  }

  static async cancelOrder(storeId: string, id: string, userId: string) {
    const current = await this.getById(storeId, id);
    if (!current) throw new Error('Hoa don khong ton tai');
    if (current.order.status === 'cancelled') throw new Error('Hoa don da bi huy truoc do');

    // Supabase JS cannot wrap this multi-step cancellation in one transaction.
    // In production, move this block to a PostgreSQL RPC for atomic stock restore,
    // order status update, payment status update and customer point rollback.
    for (const detail of current.order_details) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock_quantity, min_stock_level')
        .eq('store_id', storeId)
        .eq('id', detail.product_id)
        .single();

      if (productError || !product) continue;

      const previousStock = Number(product.stock_quantity || 0);
      const newStock = previousStock + Number(detail.quantity || 0);

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('store_id', storeId)
        .eq('id', detail.product_id);

      if (stockError) throw new Error(stockError.message);

      await supabase.from('stock_transactions').insert({
        product_id: detail.product_id,
        type: 'return',
        quantity: Number(detail.quantity || 0),
        previous_stock: previousStock,
        new_stock: newStock,
        reference_id: id,
        note: `Huy hoa don - HD ${current.order.order_number}`,
        user_id: userId,
      });

      await this.syncLowStockAlert(detail.product_id, newStock, Number(product.min_stock_level || 0));
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'unpaid',
        note: current.order.note
          ? `${current.order.note}\nCancelled at ${new Date().toISOString()}`
          : `Cancelled at ${new Date().toISOString()}`,
      })
      .eq('store_id', storeId)
      .eq('id', id)
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    await supabase.from('payments').update({ status: 'refunded' }).eq('order_id', id);

    if (current.order.customer_id) {
      const rollbackPoints = Math.floor(Number(current.order.final_amount || 0) / 10000);
      const { data: customer } = await supabase
        .from('customers')
        .select('total_spent, points')
        .eq('store_id', storeId)
        .eq('id', current.order.customer_id)
        .single();

      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_spent: Math.max(Number(customer.total_spent || 0) - Number(current.order.final_amount || 0), 0),
            points: Math.max(Number(customer.points || 0) - rollbackPoints, 0),
          })
          .eq('store_id', storeId)
          .eq('id', current.order.customer_id);
      }
    }

    return order;
  }

  static async generatePdf(storeId: string, id: string) {
    const invoice = await this.getById(storeId, id);
    if (!invoice) return null;
    return generateInvoicePDF(invoice);
  }

  private static async syncLowStockAlert(productId: string, currentStock: number, minStockLevel: number) {
    if (currentStock > minStockLevel) {
      await supabase
        .from('stock_alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('product_id', productId)
        .neq('status', 'resolved');
      return;
    }

    const alertStatus = currentStock === 0 ? 'out_of_stock' : 'low_stock';

    const { data: existingAlert } = await supabase
      .from('stock_alerts')
      .select('id')
      .eq('product_id', productId)
      .neq('status', 'resolved')
      .maybeSingle();

    if (existingAlert) {
      await supabase
        .from('stock_alerts')
        .update({
          current_stock: currentStock,
          min_stock_level: minStockLevel,
          status: alertStatus,
        })
        .eq('id', existingAlert.id);
      return;
    }

    await supabase.from('stock_alerts').insert({
      product_id: productId,
      current_stock: currentStock,
      min_stock_level: minStockLevel,
      status: alertStatus,
    });
  }
}
