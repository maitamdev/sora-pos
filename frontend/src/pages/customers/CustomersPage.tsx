import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Customer } from '../../types/product.type';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const res = await api.get('/customers', { params: { search: searchQuery || undefined } });
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Fetch customers error:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCustomers(search || undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Quản lý khách hàng</h1>
          <p className="page-subtitle">Danh sách khách hàng và điểm tích lũy</p>
        </div>
        <button className="btn-primary">+ Thêm khách hàng</button>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm kiếm khách hàng theo tên, SĐT, email..."
            className="input-field flex-1"
          />
          <button onClick={handleSearch} className="btn-primary">Tìm</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tên KH</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Điện thoại</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Điểm</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tổng chi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  Chưa có khách hàng nào
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary-600">{c.points}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{c.total_spent.toLocaleString('vi-VN')} ₫</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
