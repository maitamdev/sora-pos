import { HiOutlineSearch } from 'react-icons/hi';
import { Customer } from '../../../types/product.type';
import { OrderFilters } from '../../../types/order.type';

interface OrderFilterProps {
  filters: OrderFilters;
  customers: Customer[];
  onChange: (filters: OrderFilters) => void;
  onSubmit: () => void;
}

export default function OrderFilter({ filters, customers, onChange, onSubmit }: OrderFilterProps) {
  const updateFilter = (next: OrderFilters) => {
    onChange({ ...filters, ...next, page: 1 });
  };

  return (
    <div className="border border-slate-100 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_150px_150px_180px_150px_150px]">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search || ''}
            onChange={(e) => updateFilter({ search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="Tim ma hoa don..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>

        <input
          type="date"
          value={filters.date_from || ''}
          onChange={(e) => updateFilter({ date_from: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />

        <input
          type="date"
          value={filters.date_to || ''}
          onChange={(e) => updateFilter({ date_to: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />

        <select
          value={filters.customer_id || ''}
          onChange={(e) => updateFilter({ customer_id: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="">Tat ca khach hang</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
            </option>
          ))}
        </select>

        <select
          value={filters.status || 'all'}
          onChange={(e) => updateFilter({ status: e.target.value as OrderFilters['status'] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="all">Tat ca trang thai</option>
          <option value="completed">Hoan thanh</option>
          <option value="cancelled">Da huy</option>
          <option value="refunded">Hoan tra</option>
        </select>

        <select
          value={filters.payment_status || 'all'}
          onChange={(e) => updateFilter({ payment_status: e.target.value as OrderFilters['payment_status'] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="all">Tat ca TT</option>
          <option value="paid">Da thanh toan</option>
          <option value="unpaid">Chua thanh toan</option>
          <option value="partial">Mot phan</option>
        </select>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={filters.user_id || ''}
          onChange={(e) => updateFilter({ user_id: e.target.value || undefined })}
          placeholder="Loc theo ma nhan vien neu can..."
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        <button onClick={onSubmit} className="btn-primary px-5">
          Ap dung
        </button>
        <button
          onClick={() => onChange({ page: 1, limit: filters.limit || 20, status: 'all', payment_status: 'all' })}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Xoa loc
        </button>
      </div>
    </div>
  );
}
