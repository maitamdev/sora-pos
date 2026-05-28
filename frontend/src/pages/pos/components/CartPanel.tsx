import { HiOutlineShoppingCart } from 'react-icons/hi';
import { CartItem as CartItemType, PaymentMethod } from '../../../types/order.type';
import { formatCurrency } from '../../../utils/format';
import CartItem from './CartItem';
import CustomerSelector from './CustomerSelector';

interface CartPanelProps {
  items: CartItemType[];
  customerId: string | null;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discountAmount: number;
  total: number;
  note: string;
  onCustomerChange: (customerId: string | null) => void;
  onDiscountChange: (amount: number) => void;
  onNoteChange: (note: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onOpenPayment: () => void;
}

const paymentLabels: Record<string, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  e_wallet: 'Ví điện tử',
  qr_mock: 'QR mock',
};

export default function CartPanel({
  items,
  customerId,
  paymentMethod,
  subtotal,
  discountAmount,
  total,
  note,
  onCustomerChange,
  onDiscountChange,
  onNoteChange,
  onPaymentMethodChange,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onOpenPayment,
}: CartPanelProps) {
  return (
    <aside className="flex h-full min-h-[620px] flex-col rounded-lg border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <HiOutlineShoppingCart className="h-5 w-5 text-primary-600" />
          Giỏ hàng ({items.length})
        </div>
        {items.length > 0 && (
          <button type="button" onClick={onClear} className="text-sm font-medium text-red-500 hover:text-red-600">
            Xoa tat ca
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-slate-400">
            <HiOutlineShoppingCart className="mb-3 h-10 w-10" />
            <div className="font-medium">Chưa có sản phẩm</div>
            <div className="mt-1 text-sm">Chọn sản phẩm bên trái để thêm vào giỏ.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.product_id}
                item={item}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-slate-100 bg-white p-4">
        <CustomerSelector value={customerId} onChange={onCustomerChange} />

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Phương thức thanh toán</label>
          <select
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="cash">{paymentLabels.cash}</option>
            <option value="bank_transfer">{paymentLabels.bank_transfer}</option>
            <option value="e_wallet">{paymentLabels.e_wallet}</option>
            <option value="qr_mock">{paymentLabels.qr_mock}</option>
          </select>
        </div>

        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={2}
          placeholder="Ghi chú hóa đơn..."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />

        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tạm tính</span>
            <span className="font-medium text-slate-700">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">Giảm giá</span>
            <input
              type="number"
              value={discountAmount || ''}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
              className="w-32 rounded border border-slate-200 bg-white px-2 py-1 text-right text-sm"
              placeholder="0"
            />
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
            <span>Tổng cộng</span>
            <span className="text-primary-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPayment}
          disabled={items.length === 0}
          className="btn-primary w-full py-3 text-base font-bold shadow-lg shadow-primary-600/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Thanh toán
        </button>
      </div>
    </aside>
  );
}
