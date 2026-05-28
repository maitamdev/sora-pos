import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineSearch, HiX } from 'react-icons/hi';
import { customerAPI } from '../../../services/customer.api';
import { Customer } from '../../../types/product.type';
import { formatCurrency } from '../../../utils/format';

interface CustomerSelectorProps {
  value: string | null;
  onChange: (customerId: string | null) => void;
}

export default function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const phoneSearch = useMemo(() => search.trim().replace(/\s/g, ''), [search]);
  const canQuickCreate = phoneSearch.length >= 6 && customers.length === 0 && !loading;

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await customerAPI.getAll({ search: search || undefined });
        const data = res.data.data || [];
        setCustomers(data);

        if (value) {
          const found = data.find((customer) => customer.id === value);
          if (found) setSelectedCustomer(found);
        }
      } catch {
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, value]);

  useEffect(() => {
    if (!value) {
      setSelectedCustomer(null);
      return;
    }

    const existing = customers.find((customer) => customer.id === value);
    if (existing) {
      setSelectedCustomer(existing);
      return;
    }

    customerAPI.getById(value)
      .then((res) => setSelectedCustomer(res.data.data))
      .catch(() => setSelectedCustomer(null));
  }, [value]);

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onChange(customer.id);
    setSearch(customer.phone || customer.name);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    onChange(null);
  };

  const quickCreate = async () => {
    if (!newName.trim()) {
      toast.error('Nhập tên khách hàng');
      return;
    }
    if (!phoneSearch) {
      toast.error('Nhập số điện thoại');
      return;
    }

    try {
      setCreating(true);
      const res = await customerAPI.create({
        name: newName.trim(),
        phone: phoneSearch,
      });
      const customer = res.data.data;
      setCustomers([customer]);
      selectCustomer(customer);
      setNewName('');
      toast.success('Đã đăng ký thành viên và chọn vào hóa đơn');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể đăng ký thành viên');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">Khách hàng thành viên</label>
        {value && (
          <button type="button" onClick={clearCustomer} className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600">
            <HiX className="h-4 w-4" />
            Khách lẻ
          </button>
        )}
      </div>

      {selectedCustomer ? (
        <div className="rounded-lg border border-primary-100 bg-primary-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900">{selectedCustomer.name}</div>
              <div className="mt-0.5 text-sm text-slate-600">{selectedCustomer.phone || 'Chưa có SĐT'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Điểm</div>
              <div className="font-bold text-primary-700">{selectedCustomer.points || 0}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tổng chi tiêu: <span className="font-semibold text-slate-700">{formatCurrency(Number(selectedCustomer.total_spent || 0))}</span>
          </div>
        </div>
      ) : null}

      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nhập SĐT để tìm thành viên..."
          className="w-full rounded-lg border border-slate-200 px-9 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      {customers.length > 0 && (
        <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-100">
          {customers.slice(0, 5).map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => selectCustomer(customer)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                value === customer.id ? 'bg-primary-50' : 'bg-white'
              }`}
            >
              <span>
                <span className="font-medium text-slate-800">{customer.name}</span>
                <span className="ml-2 text-slate-400">{customer.phone}</span>
              </span>
              <span className="text-xs font-semibold text-primary-600">{customer.points || 0} diem</span>
            </button>
          ))}
        </div>
      )}

      {canQuickCreate && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-medium text-slate-500">Chưa có thành viên với SĐT {phoneSearch}</div>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên khách hàng"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={quickCreate}
              disabled={creating}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <HiOutlinePlus className="h-4 w-4" />
              Tạo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
