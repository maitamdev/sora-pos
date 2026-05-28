import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineQrcode, HiX } from 'react-icons/hi';
import { productAPI } from '../../services/product.api';
import { categoryAPI } from '../../services/category.api';
import { Product, Category, ProductFilters } from '../../types/product.type';
import { ProductFormData } from '../../validations/product.schema';
import { useAuthStore } from '../../stores/auth.store';
import ProductFormDrawer from './components/ProductForm';
import ProductFilter from './components/ProductFilter';
import ProductTable from './components/ProductTable';

export default function ProductsPage() {
  const { hasRole } = useAuthStore();
  const canManage = hasRole('admin', 'manager');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 10, status: 'active' });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);

  const qrUrl = useMemo(() => {
    if (!qrProduct) return '';
    const payload = JSON.stringify({
      id: qrProduct.id,
      sku: qrProduct.sku,
      name: qrProduct.name,
      price: qrProduct.sell_price,
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
  }, [qrProduct]);

  const fetchProducts = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await productAPI.getAll(nextFilters);
      const data = res.data.data;
      setProducts(data?.products || []);
      setTotalPages(data?.totalPages || 1);
      setTotal(data?.total || 0);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Loi khi tai danh sach san pham';
      setError(message);
      setProducts([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data?.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters.page]);

  const applyFilters = () => {
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    fetchProducts(nextFilters);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`An san pham "${product.name}"? Ban co the loc trang thai "Da an" de xem lai.`)) {
      return;
    }

    try {
      await productAPI.delete(product.id);
      toast.success('Da an san pham');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Loi khi an san pham');
    }
  };

  const handleSubmitForm = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await productAPI.update(editingProduct.id, data);
        toast.success('Cap nhat san pham thanh cong');
      } else {
        await productAPI.create(data);
        toast.success('Them san pham thanh cong');
      }
      setIsDrawerOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Da co loi xay ra');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-800">San pham</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quan ly thong tin, gia ban, ton kho va canh bao ton thap.
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-transform active:scale-95"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Them san pham
          </button>
        )}
      </div>

      <ProductFilter
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onSubmit={applyFilters}
      />

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProductTable
        products={products}
        loading={loading}
        canManage={canManage}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onShowQr={setQrProduct}
      />

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border border-slate-100 bg-white px-5 py-3">
          <span className="text-sm text-slate-500">
            Trang {filters.page || 1}/{totalPages} - {total} san pham
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, (current.page || 1) - 1) }))}
              disabled={(filters.page || 1) <= 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Truoc
            </button>
            <button
              onClick={() => setFilters((current) => ({ ...current, page: Math.min(totalPages, (current.page || 1) + 1) }))}
              disabled={(filters.page || 1) >= totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingProduct}
        isLoading={isSubmitting}
      />

      {qrProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <HiOutlineQrcode className="h-5 w-5" />
                QR san pham
              </div>
              <button onClick={() => setQrProduct(null)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <HiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img src={qrUrl} alt={`QR ${qrProduct.sku}`} className="h-56 w-56 border border-slate-100" />
              <div className="text-center">
                <div className="font-medium text-slate-900">{qrProduct.name}</div>
                <div className="text-sm text-slate-500">{qrProduct.sku}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
