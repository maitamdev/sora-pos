import { HiOutlineSearch } from 'react-icons/hi';
import { Category, ProductFilters } from '../../../types/product.type';

interface ProductFilterProps {
  filters: ProductFilters;
  categories: Category[];
  onChange: (filters: ProductFilters) => void;
  onSubmit: () => void;
}

export default function ProductFilter({ filters, categories, onChange, onSubmit }: ProductFilterProps) {
  const updateFilter = (next: ProductFilters) => {
    onChange({ ...filters, ...next, page: 1 });
  };

  return (
    <div className="border border-slate-100 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_160px_140px]">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => updateFilter({ search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="Tìm theo tên, SKU, barcode..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>

        <select
          value={filters.category_id || ''}
          onChange={(e) => updateFilter({ category_id: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status || 'active'}
          onChange={(e) => updateFilter({ status: e.target.value as ProductFilters['status'] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="active">Đang bán</option>
          <option value="inactive">Đã ẩn</option>
          <option value="all">Tất cả trạng thái</option>
        </select>

        <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={!!filters.lowStock}
            onChange={(e) => updateFilter({ lowStock: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          Tồn thấp
        </label>
      </div>
    </div>
  );
}
