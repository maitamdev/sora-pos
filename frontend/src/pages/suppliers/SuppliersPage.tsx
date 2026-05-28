import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Supplier } from '../../types/product.type';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error('Fetch suppliers error:', err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
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
          <h1 className="page-title">Quản lý nhà cung cấp</h1>
          <p className="page-subtitle">Danh sách nhà cung cấp hàng hóa</p>
        </div>
        <button className="btn-primary">+ Thêm NCC</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tên NCC</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Người liên hệ</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Điện thoại</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Địa chỉ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  Chưa có nhà cung cấp nào
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.contact_person || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{s.address || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
