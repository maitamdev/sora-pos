import { HiOutlineCube, HiOutlinePencilAlt, HiOutlineQrcode, HiOutlineTrash } from 'react-icons/hi';
import { Product } from '../../../types/product.type';
import ProductStatusBadge from './ProductStatusBadge';
import LowStockBadge from './LowStockBadge';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  canManage: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onShowQr: (product: Product) => void;
}

const currency = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} VND`;

export default function ProductTable({
  products,
  loading,
  canManage,
  onEdit,
  onDelete,
  onShowQr,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="border border-slate-100 bg-white p-8 shadow-sm">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-12 w-16 rounded bg-slate-100" />
              <div className="h-12 flex-1 rounded bg-slate-100" />
              <div className="h-12 w-36 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">SKU</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Sản phẩm</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Gia</th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Tồn kho</th>
              <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <HiOutlineCube className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-1 font-medium text-slate-600">Không tìm thấy sản phẩm</h3>
                  <p className="text-sm text-slate-400">Thử đổi từ khóa, danh mục hoặc trạng thái lọc.</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-fit items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700">
                        {product.sku}
                      </span>
                      {product.barcode && <span className="text-xs text-slate-400">{product.barcode}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <HiOutlineCube className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-[180px]">
                        <div className="line-clamp-1 text-sm font-medium text-slate-900">{product.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{product.categories?.name || 'Chưa phân loại'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-emerald-600">{currency(product.sell_price)}</div>
                    <div className="mt-0.5 text-xs text-slate-400">Nhập: {currency(product.cost_price)}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`text-sm font-bold ${
                        product.stock_quantity <= 0
                          ? 'text-red-600'
                          : product.stock_quantity <= product.min_stock_level
                            ? 'text-amber-600'
                            : 'text-slate-700'
                      }`}
                    >
                      {product.stock_quantity}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">{product.unit}</span>
                    <LowStockBadge stockQuantity={product.stock_quantity} minStockLevel={product.min_stock_level} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <ProductStatusBadge product={product} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onShowQr(product)}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title="Tạo QR"
                      >
                        <HiOutlineQrcode className="h-5 w-5" />
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => onEdit(product)}
                            className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                            title="Chỉnh sửa"
                          >
                            <HiOutlinePencilAlt className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onDelete(product)}
                            className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                            title="Ẩn sản phẩm"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
