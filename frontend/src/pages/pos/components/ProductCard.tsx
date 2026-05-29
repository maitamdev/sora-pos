import { HiOutlineCube } from 'react-icons/hi';
import { Product } from '../../../types/product.type';
import { formatCurrency } from '../../../utils/format';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  showImage: boolean;
}

export default function ProductCard({ product, onAdd, showImage }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.min_stock_level;

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      disabled={isOutOfStock}
      className={`group flex flex-col rounded-lg border bg-white p-3 text-left shadow-sm transition-all ${
        isOutOfStock
          ? 'cursor-not-allowed border-red-100 opacity-60'
          : 'border-slate-100 hover:border-primary-300 hover:shadow-md'
      }`}
    >
      {showImage && (
        <div className="mb-3 h-24 w-full overflow-hidden rounded-md bg-slate-100">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <HiOutlineCube className="h-8 w-8" />
            </div>
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</div>
        <div className="mt-1 font-mono text-xs text-slate-400">{product.sku}</div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-primary-600">{formatCurrency(product.sell_price)}</span>
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            isOutOfStock
              ? 'bg-red-50 text-red-700'
              : isLowStock
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          Kho {product.stock_quantity}
        </span>
      </div>
    </button>
  );
}
