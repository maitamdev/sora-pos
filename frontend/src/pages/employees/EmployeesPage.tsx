import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineLockClosed,
  HiOutlinePencilAlt,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineX,
} from 'react-icons/hi';
import { employeeAPI } from '../../services/employee.api';
import { useAuthStore } from '../../stores/auth.store';
import { User, UserRole } from '../../types/user.type';
import { formatDateTime } from '../../utils/format';

interface EmployeeForm {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
}

const defaultForm: EmployeeForm = {
  email: '',
  password: '',
  full_name: '',
  phone: '',
  role: 'cashier',
  is_active: true,
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  cashier: 'Thu ngân',
};

const roleStyles: Record<UserRole, string> = {
  admin: 'bg-emerald-50 text-emerald-700',
  manager: 'bg-blue-50 text-blue-700',
  cashier: 'bg-amber-50 text-amber-700',
};

export default function EmployeesPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(defaultForm);

  const availableRoles: UserRole[] = currentUser?.role === 'admin' ? ['admin', 'manager', 'cashier'] : ['cashier'];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getAll();
      setEmployees(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không tải được danh sách nhân viên');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return employees;
    return employees.filter((employee) =>
      [employee.full_name, employee.email, employee.phone, roleLabels[employee.role]]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [employees, search]);

  const openCreateForm = () => {
    setEditingEmployee(null);
    setForm(defaultForm);
    setIsFormOpen(true);
  };

  const openEditForm = (employee: User) => {
    setEditingEmployee(employee);
    setForm({
      email: employee.email,
      password: '',
      full_name: employee.full_name,
      phone: employee.phone || '',
      role: employee.role,
      is_active: employee.is_active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setIsFormOpen(false);
    setEditingEmployee(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.full_name.trim()) {
      toast.error('Vui lòng nhập tên nhân viên');
      return;
    }
    if (!editingEmployee && (!form.email.trim() || !form.password.trim())) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setSubmitting(true);
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          role: form.role,
          is_active: form.is_active,
          password: form.password.trim() || undefined,
        });
        toast.success('Đã cập nhật nhân viên');
      } else {
        await employeeAPI.create({
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          role: form.role,
          is_active: form.is_active,
        });
        toast.success('Đã thêm nhân viên');
      }
      closeForm();
      await fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không lưu được nhân viên');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (employee: User) => {
    if (employee.id === currentUser?.id) {
      toast.error('Không thể khóa tài khoản đang đăng nhập');
      return;
    }
    try {
      await employeeAPI.deactivate(employee.id);
      toast.success('Đã khóa tài khoản nhân viên');
      await fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không khóa được nhân viên');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Quản lý nhân viên</h1>
          <p className="page-subtitle">Tạo tài khoản, phân quyền và theo dõi trạng thái nhân viên.</p>
        </div>
        <button type="button" onClick={openCreateForm} className="btn-primary inline-flex items-center gap-2">
          <HiOutlinePlus className="h-5 w-5" />
          Thêm nhân viên
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Tổng nhân viên</div>
          <div className="mt-1 text-2xl font-bold text-slate-950">{employees.length}</div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Đang hoạt động</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {employees.filter((employee) => employee.is_active).length}
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Thu ngân</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {employees.filter((employee) => employee.role === 'cashier').length}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <HiOutlineUserGroup className="h-5 w-5 text-primary-600" />
            Danh sách nhân viên
          </div>
          <div className="relative w-full sm:w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              placeholder="Tìm theo tên, email, SĐT..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Nhân viên</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Vai trò</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Đăng nhập cuối</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    Đang tải danh sách nhân viên...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <HiOutlineUserGroup className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <div className="font-semibold text-slate-600">Chưa có nhân viên phù hợp</div>
                    <div className="mt-1 text-sm text-slate-400">Thêm nhân viên để cấp tài khoản bán hàng.</div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
                          {employee.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{employee.full_name}</div>
                          <div className="text-sm text-slate-500">{employee.email}</div>
                          {employee.phone && <div className="text-xs text-slate-400">{employee.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[employee.role]}`}>
                        {roleLabels[employee.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          employee.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {employee.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {employee.last_login ? formatDateTime(employee.last_login) : 'Chưa đăng nhập'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(employee)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          title="Sửa nhân viên"
                        >
                          <HiOutlinePencilAlt className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(employee)}
                          disabled={!employee.is_active || employee.id === currentUser?.id}
                          className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Khóa tài khoản"
                        >
                          <HiOutlineLockClosed className="h-5 w-5" />
                        </button>
                      </div>
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
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
                </h2>
                <p className="text-sm text-slate-500">Thông tin đăng nhập và quyền sử dụng POS.</p>
              </div>
              <button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Họ tên</label>
                <input
                  value={form.full_name}
                  onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                  className="input-field"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled={!!editingEmployee}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="input-field disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="nhanvien@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="input-field"
                    placeholder="090..."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    {editingEmployee ? 'Mật khẩu mới' : 'Mật khẩu'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="input-field"
                    placeholder={editingEmployee ? 'Bỏ trống nếu không đổi' : 'Tối thiểu 6 ký tự'}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Vai trò</label>
                  <select
                    value={form.role}
                    onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                    className="input-field bg-white"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, is_active: !current.is_active }))}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <HiOutlineShieldCheck className="h-5 w-5 text-primary-600" />
                  Tài khoản hoạt động
                </span>
                <span className={`h-6 w-11 rounded-full p-1 transition-colors ${form.is_active ? 'bg-primary-600' : 'bg-slate-300'}`}>
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      form.is_active ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : 'Lưu nhân viên'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
