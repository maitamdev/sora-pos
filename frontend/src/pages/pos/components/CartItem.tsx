import { HiOutlineMinus, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { CartItem as CartItemType } from '../../../types/order.type';
import { formatCurrency } from '../../../utils/format';

interface CartItemProps {
  item: CartItemType;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex gap-3">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white">
          {item.image_url ? (
            <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900">{item.product_name}</div>
          <div className="mt-0.5 font-mono text-xs text-slate-400">{item.sku}</div>
          <div className="mt-1 text-xs text-slate-500">{formatCurrency(item.unit_price)}</div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.product_id)}
          className="h-8 w-8 rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Xoa"
        >
          <HiOutlineTrash className="mx-auto h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => onDecrease(item.product_id)}
            className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50"
            title="Giảm"
          >
            <HiOutlineMinus className="h-4 w-4" />
          </button>
          <div className="w-10 text-center text-sm font-semibold">{item.quantity}</div>
          <button
            type="button"
            onClick={() => onIncrease(item.product_id)}
            disabled={item.quantity >= item.stock_quantity}
            className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="Tang"
          >
            <HiOutlinePlus className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-primary-600">{formatCurrency(item.subtotal)}</div>
          <div className="text-xs text-slate-400">Tồn {item.stock_quantity}</div>
        </div>
      </div>
    </div>
  );
}
