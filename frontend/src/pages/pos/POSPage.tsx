import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle, HiX } from 'react-icons/hi';
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
      toast.error(err.response?.data?.message || 'Loi khi tai san pham');
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
      toast.error(result.message || 'Khong the them san pham');
      return;
    }
    toast.success(`Da them ${product.name}`);
  };

  const handleIncrease = (productId: string) => {
    const result = increaseQuantity(productId);
    if (!result.ok) toast.error(result.message || 'Khong du ton kho');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Gio hang dang rong');
      return;
    }
    if (paymentMethod === 'cash' && receivedAmount < total) {
      toast.error('So tien khach dua chua du');
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
      toast.success('Tao hoa don thanh cong');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Loi tao hoa don');
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
                <h1 className="page-title text-2xl font-bold text-slate-900">POS ban hang</h1>
                <p className="mt-1 text-sm text-slate-500">Tim nhanh, them gio va thanh toan tai quay.</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-white px-4 py-2 text-right shadow-sm">
                <div className="text-xs text-slate-400">Trong gio</div>
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
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <HiOutlineCheckCircle className="h-6 w-6 text-emerald-600" />
                Hoa don da tao
              </div>
              <button onClick={() => setLastOrder(null)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
                <HiX className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Ma hoa don</div>
                <div className="font-mono text-lg font-bold text-slate-900">{lastOrder.order.order_number}</div>
              </div>
              <div className="max-h-52 space-y-2 overflow-y-auto">
                {lastOrder.order_details.map((detail) => (
                  <div key={detail.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-600">
                      {detail.product_name} x{detail.quantity}
                    </span>
                    <span className="font-medium text-slate-900">{formatCurrency(detail.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Giam gia</span>
                  <span>{formatCurrency(lastOrder.order.discount_amount)}</span>
                </div>
                <div className="mt-2 flex justify-between text-lg font-bold">
                  <span>Tong thanh toan</span>
                  <span className="text-primary-600">{formatCurrency(lastOrder.order.final_amount)}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50 p-4">
              <button onClick={() => setLastOrder(null)} className="btn-primary w-full py-2.5">
                Dong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
