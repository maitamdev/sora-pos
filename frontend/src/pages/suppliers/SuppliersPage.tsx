import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePencilAlt, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash, HiX } from 'react-icons/hi';
import { supplierAPI } from '../../services/supplier.api';
import { Supplier } from '../../types/supplier.type';
import { useAuthStore } from '../../stores/auth.store';

interface SupplierFormState {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_code: string;
}

const emptyForm: SupplierFormState = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  tax_code: '',
};

export default function SuppliersPage() {
  const { hasRole } = useAuthStore();
  const canEdit = hasRole('admin', 'manager');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async (pageNum = page, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await supplierAPI.getAll({
        page: pageNum,
        limit: 10,
        search: searchQuery || undefined,
        status: 'active',
      });
      const data = res.data.data;
      setSuppliers(data?.suppliers || []);
      setTotalPages(data?.totalPages || 1);
      setTotal(data?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải danh sách nhà cung cấp');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchSuppliers(1, search);
  };

  const openCreate = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      tax_code: supplier.tax_code || '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
    setForm(emptyForm);
  };

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nhập tên nhà cung cấp');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        contact_person: form.contact_person.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        tax_code: form.tax_code.trim() || undefined,
      };

      if (editingSupplier) {
        await supplierAPI.update(editingSupplier.id, payload);
        toast.success('Đã cập nhật nhà cung cấp');
      } else {
        await supplierAPI.create(payload);
        toast.success('Đã tạo nhà cung cấp mới');
      }
      closeForm();
      fetchSuppliers(1, search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể lưu nhà cung cấp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!window.confirm(`Ẩn nhà cung cấp "${supplier.name}"? Dữ liệu sản phẩm cũ vẫn sẽ được giữ lại.`)) {
      return;
    }

    try {
      await supplierAPI.delete(supplier.id);
      toast.success('Đã ẩn nhà cung cấp');
      fetchSuppliers(page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi ẩn nhà cung cấp');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-800">Nhà cung cấp</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin nhà cung cấp hàng hóa cho cửa hàng.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-transform active:scale-95"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Thêm nhà cung cấp
          </button>
        )}
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
              placeholder="Nhập tên nhà cung cấp, liên hệ, số điện thoại..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary px-5">
            Tìm kiếm
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Nhà cung cấp</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Người liên hệ</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Thông tin liên hệ</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Mã số thuế</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
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
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="font-medium text-slate-600">Chưa có nhà cung cấp nào</div>
                    <div className="mt-1 text-sm text-slate-400">Hãy thêm nhà cung cấp để quản lý nhập hàng tốt hơn.</div>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{supplier.name}</div>
                      <div className="mt-0.5 text-xs text-slate-400 max-w-xs truncate">{supplier.address || 'Chưa có địa chỉ'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-slate-700">{supplier.contact_person || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-700">{supplier.phone || '—'}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{supplier.email || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {supplier.tax_code || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => openEdit(supplier)}
                              className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                              title="Chỉnh sửa"
                            >
                              <HiOutlinePencilAlt className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier)}
                              className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                              title="Ẩn nhà cung cấp"
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

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
            <span className="text-sm text-slate-500">
              Trang {page}/{totalPages} - {total} nhà cung cấp
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white p-5 shadow-2xl rounded-lg animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">Điền đầy đủ thông tin để lưu trữ vào hệ thống.</p>
              </div>
              <button onClick={closeForm} className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
                <HiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitForm} className="space-y-4 pt-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Tên nhà cung cấp *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="input-field"
                  placeholder="Ví dụ: Công ty Cổ phần Thực phẩm Sora"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Người liên hệ</label>
                  <input
                    value={form.contact_person}
                    onChange={(e) => setForm((current) => ({ ...current, contact_person: e.target.value }))}
                    className="input-field"
                    placeholder="Tên đại diện"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Mã số thuế</label>
                  <input
                    value={form.tax_code}
                    onChange={(e) => setForm((current) => ({ ...current, tax_code: e.target.value }))}
                    className="input-field"
                    placeholder="Mã số thuế"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                    className="input-field"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                    className="input-field"
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Địa chỉ</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Địa chỉ trụ sở/kho hàng"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Đang lưu...' : editingSupplier ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
