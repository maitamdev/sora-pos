import { HiOutlineCube } from 'react-icons/hi';
import { Product } from '../../../types/product.type';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onAdd: (product: Product) => void;
}

export default function ProductGrid({ products, loading, onAdd }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-lg border border-slate-100 bg-white p-3">
            <div className="mb-3 h-24 rounded bg-slate-100" />
            <div className="mb-2 h-4 rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-center">
        <HiOutlineCube className="mb-3 h-10 w-10 text-slate-300" />
        <div className="font-medium text-slate-600">Không có sản phẩm phù hợp</div>
        <div className="mt-1 text-sm text-slate-400">Thử tìm bằng tên, SKU, barcode hoặc QR.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
