import { HiOutlineDocumentText, HiOutlineDownload, HiOutlineEye, HiOutlineXCircle } from 'react-icons/hi';
import { Order } from '../../../types/order.type';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  canCancel: boolean;
  onView: (order: Order) => void;
  onDownloadPdf: (order: Order) => void;
  onCancel: (order: Order) => void;
}

export default function OrderTable({ orders, loading, canCancel, onView, onDownloadPdf, onCancel }: OrderTableProps) {
  if (loading) {
    return (
      <div className="border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ma HD</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Khách hàng</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Nhân viên</th>
              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng tiền</th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Thanh toán</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Ngay tao</th>
              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <HiOutlineDocumentText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <div className="font-medium text-slate-600">Chưa có hóa đơn phù hợp</div>
                  <div className="mt-1 text-sm text-slate-400">Thử đổi bộ lọc hoặc tạo hóa đơn từ màn hình POS.</div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-primary-600">{order.order_number}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-slate-800">{order.customers?.name || 'Khách lẻ'}</div>
                    <div className="text-xs text-slate-400">{order.customers?.phone || ''}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{order.users?.full_name || 'N/A'}</td>
                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">{formatCurrency(order.final_amount)}</td>
                  <td className="px-5 py-4 text-center"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-4 text-center"><PaymentStatusBadge status={order.payment_status} /></td>
                  <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(order.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onView(order)} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50" title="Xem chi tiết">
                        <HiOutlineEye className="h-5 w-5" />
                      </button>
                      <button onClick={() => onDownloadPdf(order)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100" title="Tải PDF">
                        <HiOutlineDownload className="h-5 w-5" />
                      </button>
                      {canCancel && order.status !== 'cancelled' && (
                        <button onClick={() => onCancel(order)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50" title="Hủy hóa đơn">
                          <HiOutlineXCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
