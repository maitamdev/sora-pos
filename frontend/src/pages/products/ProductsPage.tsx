import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus, HiOutlineCube } from 'react-icons/hi';
import { productAPI } from '../../services/product.api';
import { Product } from '../../types/product.type';
import { ProductFormData } from '../../validations/product.schema';
import ProductFormDrawer from './components/ProductFormDrawer';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const res = await productAPI.getAll({ page, limit: 10, search: searchQuery || search || undefined });
      const data = res.data.data;
      setProducts(data?.products || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error('Fetch products error:', err);
      toast.error('Lỗi khi tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts(search || undefined);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"? Dữ liệu này có thể không thể phục hồi.`)) {
      return;
    }
    
    try {
      await productAPI.delete(id);
      toast.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleSubmitForm = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await productAPI.update(editingProduct.id, data);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productAPI.create(data);
        toast.success('Thêm sản phẩm thành công');
      }
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      throw err; // throw to prevent drawer from closing if error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-800">Sản phẩm</h1>
          <p className="page-subtitle text-slate-500 text-sm mt-1">Quản lý kho hàng và thông tin sản phẩm</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo tên, SKU, mã vạch..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-24 bg-slate-100 rounded"></div>
                <div className="h-10 flex-1 bg-slate-100 rounded"></div>
                <div className="h-10 w-32 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá bán</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Tồn kho</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                        <HiOutlineCube className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-slate-600 font-medium mb-1">Không tìm thấy sản phẩm</h3>
                      <p className="text-slate-400 text-sm">Hãy thử tìm kiếm với từ khóa khác hoặc thêm mới.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 line-clamp-1">{product.name}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{product.categories?.name || 'Chưa phân loại'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-emerald-600">{product.sell_price.toLocaleString('vi-VN')} ₫</span>
                          <span className="text-xs text-slate-400 mt-0.5" title="Giá nhập">Vốn: {product.cost_price.toLocaleString('vi-VN')} ₫</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${
                            product.stock_quantity <= 0
                              ? 'text-red-600'
                              : product.stock_quantity <= product.min_stock_level
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}>
                          {product.stock_quantity}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{product.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.stock_quantity <= 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">Hết hàng</span>
                        ) : product.stock_quantity <= product.min_stock_level ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Tồn thấp</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Còn hàng</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <HiOutlinePencilAlt className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Trang {page} trên tổng {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingProduct}
        isLoading={isSubmitting}
      />
    </div>
  );
}
