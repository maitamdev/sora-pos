import { HiX } from 'react-icons/hi';
import { OrderResult } from '../../../types/order.type';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

interface OrderDetailModalProps {
  isOpen: boolean;
  loading: boolean;
  orderDetail: OrderResult | null;
  onClose: () => void;
  onDownloadPdf: () => void;
}

const paymentLabel: Record<string, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  e_wallet: 'Ví điện tử',
  qr_mock: 'QR mock',
};

export default function OrderDetailModal({ isOpen, loading, orderDetail, onClose, onDownloadPdf }: OrderDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Chi tiết hóa đơn</h2>
            <p className="text-sm text-slate-500">{orderDetail?.order.order_number || 'Đang tải...'}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse rounded bg-slate-100" />)}
            </div>
          ) : orderDetail ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase text-slate-400">Hóa đơn</div>
                  <div className="mt-1 font-mono text-base font-bold text-primary-600">{orderDetail.order.order_number}</div>
                  <div className="mt-2 text-sm text-slate-600">{formatDateTime(orderDetail.order.created_at)}</div>
                  <div className="mt-3 flex gap-2">
                    <OrderStatusBadge status={orderDetail.order.status} />
                    <PaymentStatusBadge status={orderDetail.order.payment_status} />
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase text-slate-400">Khách hàng</div>
                  <div className="mt-1 font-semibold text-slate-900">{orderDetail.order.customers?.name || 'Khách lẻ'}</div>
                  <div className="mt-1 text-sm text-slate-500">{orderDetail.order.customers?.phone || 'Không có SĐT'}</div>
                  {orderDetail.order.customers?.points !== undefined && (
                    <div className="mt-2 text-xs text-slate-500">Điểm hiện tại: {orderDetail.order.customers.points}</div>
                  )}
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase text-slate-400">Nhân viên</div>
                  <div className="mt-1 font-semibold text-slate-900">{orderDetail.order.users?.full_name || 'N/A'}</div>
                  <div className="mt-1 text-sm text-slate-500">{orderDetail.order.users?.email || ''}</div>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">Sản phẩm</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">SL</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Đơn giá</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Giảm</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderDetail.order_details.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{detail.product_name}</div>
                          <div className="font-mono text-xs text-slate-400">{detail.products?.sku || detail.product_id}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">{detail.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(detail.unit_price)}</td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(detail.discount)}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(detail.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto w-full max-w-sm space-y-2 rounded-lg bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span>{formatCurrency(orderDetail.order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Giảm giá</span>
                  <span>{formatCurrency(orderDetail.order.discount_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
                  <span>Tổng thanh toán</span>
                  <span className="text-primary-600">{formatCurrency(orderDetail.order.final_amount)}</span>
                </div>
                {orderDetail.payment && (
                  <div className="border-t border-slate-200 pt-2 text-sm text-slate-600">
                    <div>Phương thức: {paymentLabel[orderDetail.payment.method] || orderDetail.payment.method}</div>
                    <div>Tiền nhận: {formatCurrency(orderDetail.payment.received_amount)}</div>
                    <div>Tiền thừa: {formatCurrency(orderDetail.payment.change_amount)}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">Không tải được hóa đơn</div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Đóng
          </button>
          <button onClick={onDownloadPdf} disabled={!orderDetail} className="btn-primary px-4 py-2 disabled:opacity-50">
            Tải PDF
          </button>
        </div>
      </div>
    </div>
  );
}
