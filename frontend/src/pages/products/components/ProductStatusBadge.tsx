import { Product } from '../../../types/product.type';

interface ProductStatusBadgeProps {
  product: Product;
}

export default function ProductStatusBadge({ product }: ProductStatusBadgeProps) {
  if (!product.is_active) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
        Da an
      </span>
    );
  }

  if (product.stock_quantity <= 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-700">
        Het hang
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
      Dang ban
    </span>
  );
}
