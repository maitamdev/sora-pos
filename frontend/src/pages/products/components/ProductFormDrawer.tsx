import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiX, HiOutlinePhotograph, HiOutlineCube, HiOutlineCurrencyDollar, HiOutlineCamera, HiOutlineSparkles, HiOutlineUpload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { productSchema, ProductFormData } from '../../../validations/product.schema';
import { categoryAPI } from '../../../services/category.api';
import { supplierAPI } from '../../../services/supplier.api';
import { aiAPI } from '../../../services/ai.api';
import { Category, Supplier, Product } from '../../../types/product.type';
import BarcodeScannerModal from './BarcodeScannerModal';

interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Product | null;
  isLoading?: boolean;
}

export default function ProductFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ProductFormDrawerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // UI States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      barcode: '',
      name: '',
      description: '',
      category_id: '',
      supplier_id: '',
      cost_price: 0,
      sell_price: 0,
      stock_quantity: 0,
      min_stock_level: 10,
      unit: 'cái',
      image_url: '',
    },
  });

  const costPrice = watch('cost_price');
  const sellPrice = watch('sell_price');
  const margin = costPrice && sellPrice ? ((sellPrice - costPrice) / sellPrice) * 100 : 0;

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      if (initialData) {
        setImagePreview(initialData.image_url || null);
        reset({
          sku: initialData.sku,
          barcode: initialData.barcode || '',
          name: initialData.name,
          description: initialData.description || '',
          category_id: initialData.category_id || '',
          supplier_id: initialData.supplier_id || '',
          cost_price: initialData.cost_price,
          sell_price: initialData.sell_price,
          stock_quantity: initialData.stock_quantity,
          min_stock_level: initialData.min_stock_level,
          unit: initialData.unit || 'cái',
          image_url: initialData.image_url || '',
        });
      } else {
        setImagePreview(null);
        reset({
          sku: `SP${Date.now().toString().slice(-6)}`,
          barcode: '',
          name: '',
          description: '',
          category_id: '',
          supplier_id: '',
          cost_price: 0,
          sell_price: 0,
          stock_quantity: 0,
          min_stock_level: 10,
          unit: 'cái',
          image_url: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const fetchDependencies = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        categoryAPI.getAll().catch(() => ({ data: { data: [] } })),
        supplierAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);
      setCategories(catRes.data?.data || []);
      setSuppliers(supRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching dependencies', error);
    }
  };

  // --- Image Upload (Base64) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setValue('image_url', base64String); // Save base64 to form data
    };
    reader.readAsDataURL(file);
  };

  // --- AI Recognition ---
  const handleAiRecognize = async () => {
    const currentName = watch('name');
    if (!imagePreview && (!currentName || currentName.trim() === '')) {
      toast.error('Vui lòng tải ảnh lên HOẶC nhập Tên sản phẩm để AI nhận diện.');
      return;
    }

    try {
      setIsAiProcessing(true);
      const res = await aiAPI.recognizeProduct({ image: imagePreview || undefined, productName: currentName });
      const data = res.data.data;

      if (data) {
        if (data.name) setValue('name', data.name);
        if (data.description) setValue('description', data.description);
        if (data.sku_prefix) {
          setValue('sku', `${data.sku_prefix}-${Date.now().toString().slice(-4)}`);
        }
        if (data.suggested_price) {
          setValue('sell_price', data.suggested_price);
        }
        if (data.category_id) {
          setValue('category_id', data.category_id);
        }
        toast.success('AI đã tự động điền thông tin!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi gọi AI nhận diện.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const submitForm = async (data: ProductFormData) => {
    const cleanedData = {
      ...data,
      category_id: data.category_id || undefined,
      supplier_id: data.supplier_id || undefined,
    };
    await onSubmit(cleanedData as ProductFormData);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit(submitForm)} className="space-y-6">
            
            {/* Image & AI Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
              <div className="flex gap-4">
                {/* Image Preview / Upload Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 flex-shrink-0 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:shadow-sm transition-all overflow-hidden relative group"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">Thay đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <HiOutlineUpload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs text-slate-500">Tải ảnh lên</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* AI Helper */}
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Trợ lý AI Gemini Vision</h4>
                  <p className="text-xs text-slate-500 mb-3">Tải ảnh lên HOẶC nhập từ khóa tên sản phẩm. Bấm nút dưới để Gemini tự động điền các thông tin còn lại giúp bạn (Mô tả, SKU, Giá, Danh mục).</p>
                  <button
                    type="button"
                    onClick={handleAiRecognize}
                    disabled={isAiProcessing}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-500/20"
                  >
                    {isAiProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <HiOutlineSparkles className="w-4 h-4" />
                    )}
                    {isAiProcessing ? 'AI đang phân tích...' : 'AI Tự động điền'}
                  </button>
                </div>
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary-600 flex items-center gap-2">
                <HiOutlineCube className="w-4 h-4" />
                Thông tin chung
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Mô tả sản phẩm (AI có thể giúp bạn viết phần này)..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã SKU *</label>
                  <input
                    {...register('sku')}
                    type="text"
                    className={`input-field ${errors.sku ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch (Barcode)</label>
                  <div className="relative">
                    <input
                      {...register('barcode')}
                      type="text"
                      className="input-field pr-10"
                      placeholder="Quét mã vạch..."
                    />
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Mở Camera quét mã"
                    >
                      <HiOutlineCamera className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select {...register('category_id')} className="input-field bg-white">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                  <select {...register('supplier_id')} className="input-field bg-white">
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                <input {...register('unit')} type="text" className="input-field" placeholder="cái, hộp..." />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                <HiOutlineCurrencyDollar className="w-4 h-4" />
                Giá cả & Lợi nhuận
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vốn (VNĐ) *</label>
                  <input
                    {...register('cost_price', { valueAsNumber: true })}
                    type="number"
                    className={`input-field ${errors.cost_price ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    {...register('sell_price', { valueAsNumber: true })}
                    type="number"
                    className={`input-field ${errors.sell_price ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                </div>
              </div>

              {sellPrice > 0 && (
                <div className={`p-3 rounded-lg flex justify-between items-center ${margin > 20 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : margin > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  <span className="text-sm font-medium">Lợi nhuận dự kiến (Margin):</span>
                  <span className="font-bold">{margin.toFixed(2)}%</span>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                <HiOutlinePhotograph className="w-4 h-4" />
                Tồn kho
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho ban đầu</label>
                  <input
                    {...register('stock_quantity', { valueAsNumber: true })}
                    type="number"
                    disabled={!!initialData} 
                    className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức cảnh báo hết</label>
                  <input
                    {...register('min_stock_level', { valueAsNumber: true })}
                    type="number"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isLoading || isAiProcessing}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {initialData ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
        </div>
      </div>

      <BarcodeScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={(text) => {
          setValue('barcode', text);
          toast.success('Đã quét mã vạch thành công!');
        }} 
      />
    </>
  );
}
