import { useEffect, useState } from 'react';
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

  const [qrBase64, setQrBase64] = useState<string>('');
  const [loadingQr, setLoadingQr] = useState(false);

  useEffect(() => {
    if (qrProduct) {
      setLoadingQr(true);
      productAPI.getQrCode(qrProduct.id)
        .then((res) => {
          setQrBase64(res.data.data?.qr_code || '');
        })
        .catch((err) => {
          console.error(err);
          toast.error('Lỗi khi tải mã QR từ server');
          setQrBase64('');
        })
        .finally(() => {
          setLoadingQr(false);
        });
    } else {
      setQrBase64('');
    }
  }, [qrProduct]);

  const handleDownloadQr = (product: Product, base64: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `QR_${product.sku}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải ảnh QR');
  };

  const handlePrintQr = (product: Product, base64: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>In mã QR - ${product.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
            }
            .container {
              text-align: center;
              border: 1px solid #e2e8f0;
              padding: 24px;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            img {
              width: 220px;
              height: 220px;
            }
            h2 {
              margin: 15px 0 5px 0;
              font-size: 18px;
              color: #1e293b;
            }
            p {
              margin: 5px 0;
              color: #64748b;
              font-size: 14px;
            }
            .price {
              color: #059669;
              font-weight: bold;
              font-size: 16px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${base64}" />
            <h2>${product.name}</h2>
            <p>SKU: ${product.sku}</p>
            <p class="price">${Number(product.sell_price || 0).toLocaleString('vi-VN')} VND</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
      const message = err.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm';
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
    if (!window.confirm(`Ẩn sản phẩm "${product.name}"? Bạn có thể lọc trạng thái "Đã ẩn" để xem lại.`)) {
      return;
    }

    try {
      await productAPI.delete(product.id);
      toast.success('Đã ẩn sản phẩm');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi ẩn sản phẩm');
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
      setIsDrawerOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-800">Sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin, giá bán, tồn kho và cảnh báo tồn thấp.
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-transform active:scale-95"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Thêm sản phẩm
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
            Trang {filters.page || 1}/{totalPages} - {total} sản phẩm
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, (current.page || 1) - 1) }))}
              disabled={(filters.page || 1) <= 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Trước
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white p-5 shadow-2xl rounded-lg animate-scale-up">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <HiOutlineQrcode className="h-5 w-5 text-primary-600" />
                Mã QR sản phẩm
              </div>
              <button onClick={() => setQrProduct(null)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <HiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {loadingQr ? (
                <div className="flex h-56 w-56 items-center justify-center border border-slate-100 bg-slate-50/50 rounded-lg">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
                </div>
              ) : qrBase64 ? (
                <>
                  <img src={qrBase64} alt={`QR ${qrProduct.sku}`} className="h-56 w-56 border border-slate-100 shadow-sm rounded-lg" />
                  <div className="text-center w-full">
                    <div className="font-bold text-slate-800 text-base line-clamp-1">{qrProduct.name}</div>
                    <div className="text-xs text-slate-500 mt-1">SKU: <span className="font-mono text-slate-700 font-semibold">{qrProduct.sku}</span></div>
                    <div className="text-sm text-emerald-600 font-bold mt-1.5">{Number(qrProduct.sell_price || 0).toLocaleString('vi-VN')} VND</div>
                  </div>
                  
                  <div className="flex gap-2 w-full mt-2">
                    <button
                      onClick={() => handleDownloadQr(qrProduct, qrBase64)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      📥 Tải xuống
                    </button>
                    <button
                      onClick={() => handlePrintQr(qrProduct, qrBase64)}
                      className="flex-1 btn-primary py-2 text-sm font-semibold transition-colors"
                    >
                      🖨️ In mã QR
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-56 w-56 items-center justify-center border border-dashed border-red-200 text-sm text-red-500 bg-rose-50/50 rounded-lg">
                  Lỗi tạo mã QR
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
