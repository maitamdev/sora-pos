import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineDocumentDownload,
  HiOutlinePrinter,
  HiX,
} from 'react-icons/hi';
import { useCartStore } from '../../stores/cart.store';
import { productAPI } from '../../services/product.api';
import { orderAPI } from '../../services/order.api';
import { Product } from '../../types/product.type';
import { OrderResult } from '../../types/order.type';
import { formatCurrency } from '../../utils/format';
import ProductSearch from './components/ProductSearch';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';

const normalizeSearchTerm = (value?: string) => {
  const term = value?.trim();
  if (!term) return undefined;

  try {
    const parsed = JSON.parse(term) as { sku?: string; name?: string };
    return parsed.sku || parsed.name || term;
  } catch {
    return term;
  }
};

export default function POSPage() {
  const {
    items,
    customerId,
    paymentMethod,
    discountAmount,
    receivedAmount,
    note,
    subtotal,
    total,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    setCustomer,
    setPaymentMethod,
    setDiscountAmount,
    setReceivedAmount,
    setNote,
    clearCart,
  } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderResult | null>(null);

  const fetchProducts = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const res = await productAPI.getAll({
        limit: 100,
        search: normalizeSearchTerm(searchQuery),
        status: 'active',
      });
      setProducts(res.data.data?.products || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchProducts(search);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const cartQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const handleAddToCart = (product: Product) => {
    const result = addItem(product);
    if (!result.ok) {
      toast.error(result.message || 'Không thể thêm sản phẩm');
      return;
    }
    toast.success(`Đã thêm ${product.name}`);
  };

  const handleIncrease = (productId: string) => {
    const result = increaseQuantity(productId);
    if (!result.ok) toast.error(result.message || 'Không đủ tồn kho');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Giỏ hàng đang rỗng');
      return;
    }
    if (paymentMethod === 'cash' && receivedAmount < total) {
      toast.error('Số tiền khách đưa chưa đủ');
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderAPI.create({
        customer_id: customerId || undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          discount: item.discount,
        })),
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        received_amount: paymentMethod === 'cash' ? receivedAmount : total,
        note: note || undefined,
      });

      const result = res.data.data;
      setLastOrder(result);
      clearCart();
      setIsPaymentOpen(false);
      await fetchProducts(search);
      toast.success('Tạo hóa đơn thành công');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tạo hóa đơn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] min-h-[720px]">
      <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
        <section className="flex min-h-0 flex-col">
          <div className="mb-4">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <h1 className="page-title text-2xl font-bold text-slate-900">POS bán hàng</h1>
                <p className="mt-1 text-sm text-slate-500">Tìm nhanh, thêm giỏ và thanh toán tại quầy.</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-white px-4 py-2 text-right shadow-sm">
                <div className="text-xs text-slate-400">Trong giỏ</div>
                <div className="text-lg font-bold text-primary-600">{cartQuantity} SP</div>
              </div>
            </div>
            <ProductSearch value={search} onChange={setSearch} onSubmit={() => fetchProducts(search)} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ProductGrid products={products} loading={loading} onAdd={handleAddToCart} />
          </div>
        </section>

        <CartPanel
          items={items}
          customerId={customerId}
          paymentMethod={paymentMethod}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          note={note}
          onCustomerChange={setCustomer}
          onDiscountChange={setDiscountAmount}
          onNoteChange={setNote}
          onPaymentMethodChange={setPaymentMethod}
          onIncrease={handleIncrease}
          onDecrease={decreaseQuantity}
          onRemove={removeItem}
          onClear={clearCart}
          onOpenPayment={() => setIsPaymentOpen(true)}
        />
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        paymentMethod={paymentMethod}
        total={total}
        receivedAmount={receivedAmount}
        submitting={submitting}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentMethodChange={setPaymentMethod}
        onReceivedAmountChange={setReceivedAmount}
        onConfirm={handleCheckout}
      />

      {lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
                    <HiOutlineCheckCircle className="h-5 w-5" />
                    Thanh toán thành công
                  </div>
                  <div className="mt-2 font-mono text-xl font-bold">{lastOrder.order.order_number}</div>
                  <div className="mt-1 text-sm text-white/80">
                    {new Date(lastOrder.order.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
                <button onClick={() => setLastOrder(null)} className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white">
                  <HiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Khách hàng</div>
                  <div className="mt-1 font-semibold text-slate-900">{lastOrder.order.customers?.name || 'Khách lẻ'}</div>
                  <div className="text-sm text-slate-500">{lastOrder.order.customers?.phone || 'Không có SĐT'}</div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Thanh toán</div>
                  <div className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                    <HiOutlineCash className="h-5 w-5 text-emerald-600" />
                    {lastOrder.payment?.method === 'cash'
                      ? 'Tiền mặt'
                      : lastOrder.payment?.method === 'bank_transfer'
                        ? 'Chuyển khoản'
                        : lastOrder.payment?.method === 'e_wallet'
                          ? 'Ví điện tử'
                          : 'QR mock'}
                  </div>
                  <div className="text-sm text-slate-500">Đã ghi nhận thanh toán</div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  Sản phẩm đã bán
                </div>
                <div className="max-h-56 divide-y divide-slate-100 overflow-y-auto">
                  {lastOrder.order_details.map((detail) => (
                    <div key={detail.id} className="flex items-start justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-medium text-slate-900">{detail.product_name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {formatCurrency(detail.unit_price)} x {detail.quantity}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-sm font-semibold text-slate-900">
                        {formatCurrency(detail.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-4 text-white">
                <div className="flex justify-between text-sm text-white/70">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(lastOrder.order.total_amount)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-white/70">
                  <span>Giảm giá</span>
                  <span>{formatCurrency(lastOrder.order.discount_amount)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-xl font-bold">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(lastOrder.order.final_amount)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-slate-100 bg-slate-50 p-4">
              <button
                onClick={async () => {
                  const res = await orderAPI.downloadPdf(lastOrder.order.id);
                  const blob = new Blob([res.data], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${lastOrder.order.order_number}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <HiOutlineDocumentDownload className="h-5 w-5" />
                PDF
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <HiOutlinePrinter className="h-5 w-5" />
                In
              </button>
              <button onClick={() => setLastOrder(null)} className="btn-primary py-2.5">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
