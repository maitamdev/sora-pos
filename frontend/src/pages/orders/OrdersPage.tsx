import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/order.api';
import { Order } from '../../types/order.type';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll({ page, limit });
      const data = res.data.data;
      setOrders(data?.orders || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'completed': return <span className="badge-success">Hoàn thành</span>;
      case 'cancelled': return <span className="badge-danger">Đã hủy</span>;
      case 'refunded': return <span className="badge-warning">Hoàn trả</span>;
      default: return <span className="text-sm text-gray-500">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Quản lý hóa đơn</h1>
        <p className="page-subtitle">Lịch sử hóa đơn bán hàng</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Mã HĐ</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nhân viên</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Chưa có hóa đơn nào
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-primary-600">{order.order_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.customers?.name || 'Khách lẻ'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.users?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {order.final_amount.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-4 py-3">{statusLabel(order.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 text-sm rounded border disabled:opacity-50">
              ← Trước
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">Trang {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 text-sm rounded border disabled:opacity-50">
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
