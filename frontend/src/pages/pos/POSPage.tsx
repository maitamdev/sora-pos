import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../../stores/cart.store';
import { productAPI } from '../../services/product.api';
import { orderAPI } from '../../services/order.api';
import { Product } from '../../types/product.type';
import { OrderResult } from '../../types/order.type';
import ProductSearch from './components/ProductSearch';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';
import InvoiceSuccessModal from './components/InvoiceSuccessModal';

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

      const createdOrder = res.data.data;
      const detailRes = await orderAPI.getById(createdOrder.order.id);
      setLastOrder(detailRes.data.data);
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

      {lastOrder && <InvoiceSuccessModal order={lastOrder} onClose={() => setLastOrder(null)} />}
    </div>
  );
}
