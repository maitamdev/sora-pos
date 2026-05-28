import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePencilAlt, HiOutlinePlus, HiOutlineSearch, HiX } from 'react-icons/hi';
import { customerAPI } from '../../services/customer.api';
import { Customer } from '../../types/product.type';
import { formatCurrency } from '../../utils/format';
import { useAuthStore } from '../../stores/auth.store';

interface CustomerFormState {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const emptyForm: CustomerFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
};

export default function CustomersPage() {
  const { hasRole } = useAuthStore();
  const canEdit = hasRole('admin', 'manager');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll({ search: searchQuery || undefined });
      setCustomers(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải danh sách khách hàng');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreate = () => {
    setEditingCustomer(null);
    setForm({ ...emptyForm, phone: /^\d{6,}$/.test(search.trim()) ? search.trim() : '' });
    setIsFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
    setForm(emptyForm);
  };

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nhập tên khách hàng');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Nhập số điện thoại để tích điểm');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCustomer) {
        await customerAPI.update(editingCustomer.id, form);
        toast.success('Đã cập nhật khách hàng');
      } else {
        await customerAPI.create(form);
        toast.success('Đã đăng ký thành viên');
      }
      closeForm();
      fetchCustomers(search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể lưu khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    fetchCustomers(search);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-900">Khách hàng thành viên</h1>
          <p className="mt-1 text-sm text-slate-500">
            Đăng ký thành viên, tra cứu bằng số điện thoại và theo dõi điểm tích lũy.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="h-5 w-5" />
          Đăng ký thành viên
        </button>
      </div>

      <div className="border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập số điện thoại, tên hoặc email khách hàng..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary px-5">
            Tìm
          </button>
          <button onClick={openCreate} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Tao moi
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Khách hàng</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Lien he</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Điểm</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng chi</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map((item) => (
                  <tr key={item}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-10 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="font-medium text-slate-600">Chưa tìm thấy khách hàng</div>
                    <div className="mt-1 text-sm text-slate-400">Nhập SĐT rồi bấm Đăng ký thành viên để tạo mới.</div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{customer.name}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{customer.address || 'Chưa có địa chỉ'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-700">{customer.phone || 'Chưa có SĐT'}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{customer.email || 'Chưa có email'}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-primary-600">{customer.points || 0}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {formatCurrency(Number(customer.total_spent || 0))}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {canEdit && (
                        <button
                          onClick={() => openEdit(customer)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <HiOutlinePencilAlt className="h-4 w-4" />
                          Sửa
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingCustomer ? 'Cập nhật khách hàng' : 'Đăng ký thành viên'}
                </h2>
                <p className="text-sm text-slate-500">SĐT được dùng để tra cứu và tích điểm khi thanh toán.</p>
              </div>
              <button onClick={closeForm} className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
                <HiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitForm} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên khách hàng *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="input-field"
                  placeholder="Nguyen Van A"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại *</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                  className="input-field"
                  placeholder="090..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Địa chỉ</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
                    className="input-field"
                    placeholder="Địa chỉ"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={closeForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="btn-primary px-5 disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : editingCustomer ? 'Lưu thay đổi' : 'Đăng ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
