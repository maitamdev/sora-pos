import { useEffect, useState } from 'react';
import { customerAPI } from '../../../services/customer.api';
import { Customer } from '../../../types/product.type';

interface CustomerSelectorProps {
  value: string | null;
  onChange: (customerId: string | null) => void;
}

export default function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await customerAPI.getAll({ search: search || undefined });
        setCustomers(res.data.data || []);
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">Khach hang</label>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-xs font-medium text-red-500 hover:text-red-600">
            Bo chon
          </button>
        )}
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tim khach hang theo ten, SDT..."
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      />
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      >
        <option value="">{loading ? 'Dang tai...' : 'Khach le'}</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
