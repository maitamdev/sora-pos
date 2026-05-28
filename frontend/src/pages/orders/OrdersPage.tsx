import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/order.api';
import { customerAPI } from '../../services/customer.api';
import { Customer } from '../../types/product.type';
import { Order, OrderFilters, OrderResult } from '../../types/order.type';
import { useAuthStore } from '../../stores/auth.store';
import OrderFilter from './components/OrderFilter';
import OrderTable from './components/OrderTable';
import OrderDetailModal from './components/OrderDetailModal';

const limit = 20;

export default function OrdersPage() {
  const { hasRole } = useAuthStore();
  const canCancel = hasRole('admin', 'manager');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({ page: 1, limit, status: 'all', payment_status: 'all' });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResult | null>(null);

  const fetchOrders = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getAll(nextFilters);
      const data = res.data.data;
      setOrders(data?.orders || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Loi khi tai danh sach hoa don';
      setError(message);
      setOrders([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll();
      setCustomers(res.data.data || []);
    } catch {
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchOrders(filters);
  }, [filters.page]);

  const applyFilters = () => {
    const next = { ...filters, page: 1 };
    setFilters(next);
    fetchOrders(next);
  };

  const openDetail = async (order: Order) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setSelectedOrder(null);
      const res = await orderAPI.getById(order.id);
      setSelectedOrder(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Khong tai duoc chi tiet hoa don');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const downloadPdf = async (order: Order) => {
    try {
      const res = await orderAPI.downloadPdf(order.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Khong tai duoc PDF');
    }
  };

  const downloadSelectedPdf = () => {
    if (!selectedOrder) return;
    downloadPdf(selectedOrder.order);
  };

  const cancelOrder = async (order: Order) => {
    if (!window.confirm(`Huy hoa don ${order.order_number}? Ton kho se duoc hoan lai.`)) return;

    try {
      await orderAPI.cancel(order.id);
      toast.success('Da huy hoa don va hoan kho');
      fetchOrders();
      if (selectedOrder?.order.id === order.id) {
        const res = await orderAPI.getById(order.id);
        setSelectedOrder(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Khong the huy hoa don');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-900">Quan ly hoa don</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tra cuu giao dich, xem chi tiet, tai PDF va huy hoa don theo quyen.
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white px-4 py-2 text-right shadow-sm">
          <div className="text-xs text-slate-400">Tong ket qua</div>
          <div className="text-lg font-bold text-primary-600">{total}</div>
        </div>
      </div>

      <OrderFilter filters={filters} customers={customers} onChange={setFilters} onSubmit={applyFilters} />

      {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <OrderTable
        orders={orders}
        loading={loading}
        canCancel={canCancel}
        onView={openDetail}
        onDownloadPdf={downloadPdf}
        onCancel={cancelOrder}
      />

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border border-slate-100 bg-white px-5 py-3">
          <span className="text-sm text-slate-500">
            Trang {filters.page || 1}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, (current.page || 1) - 1) }))}
              disabled={(filters.page || 1) <= 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Truoc
            </button>
            <button
              onClick={() => setFilters((current) => ({ ...current, page: Math.min(totalPages, (current.page || 1) + 1) }))}
              disabled={(filters.page || 1) >= totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <OrderDetailModal
        isOpen={detailOpen}
        loading={detailLoading}
        orderDetail={selectedOrder}
        onClose={() => setDetailOpen(false)}
        onDownloadPdf={downloadSelectedPdf}
      />
    </div>
  );
}
