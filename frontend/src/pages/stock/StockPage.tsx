import { useState, useEffect } from 'react';
import { stockAPI } from '../../services/stock.api';
import { StockAlert, StockTransaction } from '../../types/stock.type';

type TabType = 'alerts' | 'transactions';

export default function StockPage() {
  const [tab, setTab] = useState<TabType>('alerts');
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === 'alerts') fetchAlerts();
    else fetchTransactions();
  }, [tab]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await stockAPI.getAlerts();
      setAlerts(res.data.data || []);
    } catch (err) {
      console.error('Fetch alerts error:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await stockAPI.getTransactions({});
      setTransactions(res.data.data?.transactions || []);
    } catch (err) {
      console.error('Fetch transactions error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Quản lý kho hàng</h1>
          <p className="page-subtitle">Nhập kho, điều chỉnh tồn kho và xem cảnh báo</p>
        </div>
        <button className="btn-primary">+ Nhập kho</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('alerts')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'alerts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          ⚠️ Cảnh báo tồn kho
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'transactions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          📊 Lịch sử giao dịch
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : tab === 'alerts' ? (
        /* Stock Alerts */
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm cần nhập thêm</h3>
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <span className="text-3xl block mb-2">✅</span>
              Không có cảnh báo tồn kho nào
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        alert.status === 'out_of_stock' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {alert.products?.name || 'Sản phẩm không xác định'}
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU: {alert.products?.sku} ・ Tồn kho:{' '}
                        <span className="font-semibold text-red-600">{alert.current_stock}</span> / Min:{' '}
                        {alert.min_stock_level} ・ ĐVT: {alert.products?.unit || '—'}
                      </p>
                    </div>
                  </div>
                  <span className={alert.status === 'out_of_stock' ? 'badge-danger' : 'badge-warning'}>
                    {alert.status === 'out_of_stock' ? 'Hết hàng' : 'Tồn thấp'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Transactions */
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Loại</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Số lượng</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trước</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sau</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Người thực hiện</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Chưa có giao dịch kho nào
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {t.products?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          t.type === 'import'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.type === 'sale'
                            ? 'bg-blue-100 text-blue-700'
                            : t.type === 'return'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t.type === 'import' ? 'Nhập kho' : t.type === 'sale' ? 'Bán' : t.type === 'return' ? 'Trả hàng' : 'Điều chỉnh'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={t.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {t.quantity > 0 ? '+' : ''}{t.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{t.previous_stock}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{t.new_stock}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.users?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(t.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
