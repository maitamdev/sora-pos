import { useState, useEffect } from 'react';
import { useCartStore } from '../../stores/cart.store';
import { productAPI } from '../../services/product.api';
import { orderAPI } from '../../services/order.api';
import { Product } from '../../types/product.type';

export default function POSPage() {
  const {
    items,
    totalAmount,
    finalAmount,
    discountAmount,
    receivedAmount,
    paymentMethod,
    addItem,
    removeItem,
    updateQuantity,
    setDiscountAmount,
    setReceivedAmount,
    setPaymentMethod,
    clearCart,
  } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const res = await productAPI.getAll({ limit: 100, search: searchQuery });
      setProducts(res.data.data?.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    // Debounce search
    const timer = setTimeout(() => fetchProducts(value || undefined), 300);
    return () => clearTimeout(timer);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      setMessage({ type: 'error', text: `${product.name} đã hết hàng!` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    // Kiểm tra số lượng trong giỏ không vượt quá tồn kho
    const existingItem = items.find((i) => i.product_id === product.id);
    if (existingItem && existingItem.quantity >= product.stock_quantity) {
      setMessage({ type: 'error', text: `${product.name}: không đủ tồn kho (còn ${product.stock_quantity})` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    addItem(product);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (receivedAmount < finalAmount) {
      setMessage({ type: 'error', text: 'Số tiền nhận chưa đủ!' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
        })),
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        received_amount: receivedAmount,
      };

      await orderAPI.create(orderData);
      setMessage({ type: 'success', text: 'Tạo hóa đơn thành công!' });
      clearCart();
      fetchProducts(); // Refresh tồn kho
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: axiosErr.response?.data?.message || 'Lỗi tạo hóa đơn' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const changeAmount = receivedAmount - finalAmount;

  return (
    <div className="h-[calc(100vh-3rem)]">
      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Sản phẩm - bên trái */}
        <div className="col-span-7 flex flex-col">
          <div className="mb-4">
            <h1 className="page-title">POS Bán hàng</h1>
            <div className="mt-3">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="🔍 Tìm sản phẩm theo tên, SKU hoặc quét barcode..."
                className="input-field"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="text-4xl mb-2">📦</span>
                <p className="font-medium">Không có sản phẩm nào</p>
                <p className="text-sm">Hãy thêm sản phẩm trong trang Quản lý sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_quantity <= 0}
                    className={`bg-white rounded-xl p-4 text-left border transition-all ${
                      product.stock_quantity <= 0
                        ? 'border-red-200 opacity-60 cursor-not-allowed'
                        : 'border-gray-100 hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-2xl">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        '📦'
                      )}
                    </div>
                    <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.sku}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-primary-600 font-semibold text-sm">
                        {product.sell_price.toLocaleString('vi-VN')} ₫
                      </p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          product.stock_quantity <= 0
                            ? 'bg-red-100 text-red-600'
                            : product.stock_quantity <= product.min_stock_level
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        Kho: {product.stock_quantity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Giỏ hàng - bên phải */}
        <div className="col-span-5 bg-white rounded-xl border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">
                🛒 Giỏ hàng ({items.length} SP)
              </h2>
              {items.length > 0 && (
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 p-4 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-2">🛒</span>
                <p>Chưa có sản phẩm nào</p>
                <p className="text-sm">Nhấn vào sản phẩm để thêm</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-500">
                        {item.unit_price.toLocaleString('vi-VN')} ₫
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) updateQuantity(item.product_id, item.quantity - 1);
                            else removeItem(item.product_id);
                          }}
                          className="w-6 h-6 rounded bg-gray-200 text-gray-700 flex items-center justify-center text-xs hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity < item.stock_quantity) {
                              updateQuantity(item.product_id, item.quantity + 1);
                            }
                          }}
                          className="w-6 h-6 rounded bg-gray-200 text-gray-700 flex items-center justify-center text-xs hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">
                        {item.subtotal.toLocaleString('vi-VN')} ₫
                      </p>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-xs text-red-400 hover:text-red-600 mt-1"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & Payment */}
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tạm tính</span>
              <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Giảm giá</span>
              <input
                type="number"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-28 text-right px-2 py-1 border border-gray-200 rounded text-sm"
              />
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Tổng cộng</span>
              <span className="text-primary-600">{finalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>

            {/* Payment */}
            <div className="flex gap-2">
              {(['cash', 'card', 'transfer', 'momo'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${
                    paymentMethod === m ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {m === 'cash' ? '💵 Tiền mặt' : m === 'card' ? '💳 Thẻ' : m === 'transfer' ? '🏦 CK' : '📱 MoMo'}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Tiền nhận</span>
              <input
                type="number"
                value={receivedAmount || ''}
                onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-28 text-right px-2 py-1 border border-gray-200 rounded text-sm"
              />
            </div>

            {receivedAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tiền thừa</span>
                <span className={changeAmount >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                  {changeAmount >= 0 ? changeAmount.toLocaleString('vi-VN') : 'Chưa đủ'} ₫
                </span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || submitting}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '⏳ Đang xử lý...' : '💳 Thanh toán'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
