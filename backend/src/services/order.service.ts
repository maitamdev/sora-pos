import { supabase } from '../config/supabase';
import { CreateOrderInput, OrderResult } from '../types/order.type';
import { generateOrderNumber } from '../utils/calculate';
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

  static async getAll(storeId: string, page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select('*, customers(name), users(full_name)', { count: 'exact' })
      .eq('store_id', storeId)
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

  static async getById(storeId: string, id: string) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, customers(name), users(full_name)')
      .eq('store_id', storeId)
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
