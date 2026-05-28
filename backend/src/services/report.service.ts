import { supabase } from '../config/supabase';

export class ReportService {
  /**
   * Dữ liệu dashboard tổng quan
   */
  static async getDashboard() {
    // Tổng doanh thu hôm nay
    const today = new Date().toISOString().slice(0, 10);

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('final_amount')
      .eq('status', 'completed')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    const todayRevenue = todayOrders?.reduce((sum, o) => sum + (o.final_amount || 0), 0) || 0;
    const todayOrderCount = todayOrders?.length || 0;

    // Tổng sản phẩm
    const { count: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // Số cảnh báo tồn kho
    const { count: stockAlerts } = await supabase
      .from('stock_alerts')
      .select('id', { count: 'exact' })
      .neq('status', 'resolved');

    // Tổng khách hàng
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    return {
      today_revenue: todayRevenue,
      today_orders: todayOrderCount,
      total_products: totalProducts || 0,
      stock_alerts: stockAlerts || 0,
      total_customers: totalCustomers || 0,
    };
  }

  /**
   * Sản phẩm bán chạy nhất (top N)
   */
  static async getTopProducts(limit: number = 10, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('order_details')
      .select('product_id, product_name, quantity')
      .gte('created_at', startDate.toISOString());

    if (error) throw new Error(error.message);

    // Aggregate by product
    const productMap = new Map<string, { product_id: string; product_name: string; total_sold: number }>();
    data?.forEach((d) => {
      const existing = productMap.get(d.product_id);
      if (existing) {
        existing.total_sold += d.quantity;
      } else {
        productMap.set(d.product_id, {
          product_id: d.product_id,
          product_name: d.product_name,
          total_sold: d.quantity,
        });
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, limit);
  }

  /**
   * Báo cáo doanh thu theo ngày (N ngày gần đây)
   */
  static async getRevenueByDay(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('orders')
      .select('final_amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    if (error) throw new Error(error.message);

    // Group by date
    const revenueMap = new Map<string, number>();
    data?.forEach((order) => {
      const date = order.created_at.slice(0, 10);
      revenueMap.set(date, (revenueMap.get(date) || 0) + (order.final_amount || 0));
    });

    return Array.from(revenueMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  /**
   * Sản phẩm tồn kho thấp
   */
  static async getLowStockProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, min_stock_level, unit')
      .eq('is_active', true)
      .filter('stock_quantity', 'lte', 'min_stock_level' as unknown as number);

    // Fallback: lấy tất cả rồi filter phía app
    if (error) {
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, min_stock_level, unit')
        .eq('is_active', true);

      return allProducts?.filter((p) => p.stock_quantity <= p.min_stock_level) || [];
    }

    return data || [];
  }
}
