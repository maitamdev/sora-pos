import { useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineBadgeCheck,
  HiOutlineCash,
  HiOutlineDocumentDownload,
  HiOutlinePrinter,
  HiX,
} from 'react-icons/hi';
import { orderAPI } from '../../../services/order.api';
import { useSettingsStore } from '../../../stores/settings.store';
import { OrderResult } from '../../../types/order.type';
import { formatCurrency } from '../../../utils/format';

interface InvoiceSuccessModalProps {
  order: OrderResult;
  onClose: () => void;
}

const paymentLabel: Record<string, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  e_wallet: 'Ví điện tử',
  qr_mock: 'QR mock',
};

export default function InvoiceSuccessModal({ order, onClose }: InvoiceSuccessModalProps) {
  const invoice = order.order;
  const payment = order.payment;
  const storeName = useSettingsStore((state) => state.storeName);
  const storeAddress = useSettingsStore((state) => state.storeAddress);
  const storePhone = useSettingsStore((state) => state.storePhone);
  const storeTaxCode = useSettingsStore((state) => state.storeTaxCode);
  const receiptFooter = useSettingsStore((state) => state.receiptFooter);
  const autoPrintReceipt = useSettingsStore((state) => state.autoPrintReceipt);

  useEffect(() => {
    if (!autoPrintReceipt) return;
    const timer = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(timer);
  }, [autoPrintReceipt, invoice.id]);

  const downloadPdf = async () => {
    try {
      const res = await orderAPI.downloadPdf(invoice.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Không tải được PDF hóa đơn');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[1fr_320px]">
        <section className="bg-white">
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <div className="mb-4">
                <div className="text-xl font-black text-slate-950">{storeName}</div>
                {storeAddress && <div className="mt-1 text-sm text-slate-500">{storeAddress}</div>}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                  {storePhone && <span>SĐT: {storePhone}</span>}
                  {storeTaxCode && <span>MST: {storeTaxCode}</span>}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                <HiOutlineBadgeCheck className="h-5 w-5" />
                Thanh toán thành công
              </div>
              <h2 className="mt-3 font-mono text-2xl font-bold text-slate-950">{invoice.order_number}</h2>
              <p className="mt-1 text-sm text-slate-500">{new Date(invoice.created_at).toLocaleString('vi-VN')}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <HiX className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Khách hàng</div>
                <div className="mt-2 font-semibold text-slate-950">{invoice.customers?.name || 'Khách lẻ'}</div>
                <div className="mt-1 text-sm text-slate-500">{invoice.customers?.phone || 'Không có SĐT'}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Nhân viên</div>
                <div className="mt-2 font-semibold text-slate-950">{invoice.users?.full_name || 'N/A'}</div>
                <div className="mt-1 text-sm text-slate-500">Đã ghi nhận giao dịch</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Thanh toán</div>
                <div className="mt-2 flex items-center gap-2 font-semibold text-slate-950">
                  <HiOutlineCash className="h-5 w-5 text-emerald-600" />
                  {paymentLabel[payment?.method || ''] || payment?.method || 'N/A'}
                </div>
                <div className="mt-1 text-sm text-emerald-600">Đã thanh toán</div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
              <div className="grid grid-cols-[1fr_72px_120px] bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white">
                <span>Sản phẩm</span>
                <span className="text-right">SL</span>
                <span className="text-right">Thành tiền</span>
              </div>
              <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                {order.order_details.map((detail) => (
                  <div key={detail.id} className="grid grid-cols-[1fr_72px_120px] items-start gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="line-clamp-2 font-medium text-slate-900">{detail.product_name}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatCurrency(detail.unit_price)} / sản phẩm</div>
                    </div>
                    <div className="text-right font-semibold text-slate-700">x{detail.quantity}</div>
                    <div className="text-right font-bold text-slate-950">{formatCurrency(detail.subtotal)}</div>
                  </div>
                ))}
              </div>
            </div>
            {receiptFooter && (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-500">
                {receiptFooter}
              </div>
            )}
          </div>
        </section>

        <aside className="flex flex-col bg-slate-950 p-6 text-white">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/50">Tổng thanh toán</div>
            <div className="mt-2 text-3xl font-black">{formatCurrency(invoice.final_amount)}</div>
          </div>

          <div className="mt-8 space-y-3 rounded-xl bg-white/5 p-4">
            <div className="flex justify-between text-sm text-white/70">
              <span>Tạm tính</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/70">
              <span>Giảm giá</span>
              <span>{formatCurrency(invoice.discount_amount)}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-sm text-white/70">
                <span>Tiền nhận</span>
                <span>{formatCurrency(payment?.received_amount || invoice.final_amount)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-white/70">
                <span>Tiền thừa</span>
                <span>{formatCurrency(payment?.change_amount || 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-6">
            <button
              onClick={downloadPdf}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-100"
            >
              <HiOutlineDocumentDownload className="h-5 w-5" />
              Tải hóa đơn PDF
            </button>
            <button
              onClick={() => window.print()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              <HiOutlinePrinter className="h-5 w-5" />
              In nhanh
            </button>
            <button onClick={onClose} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Đóng
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
