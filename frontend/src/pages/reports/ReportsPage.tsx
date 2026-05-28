import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/report.api';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface RevenueDay {
  date: string;
  revenue: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
}

type TabType = 'revenue' | 'top' | 'stock';

export default function ReportsPage() {
  const [tab, setTab] = useState<TabType>('revenue');
  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [revenueDays, setRevenueDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === 'revenue') fetchRevenue();
    else if (tab === 'top') fetchTopProducts();
    else fetchLowStock();
  }, [tab, revenueDays]);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getRevenue({ days: revenueDays });
      setRevenueData(res.data.data || []);
    } catch (err) {
      console.error(err);
      setRevenueData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getTopProducts({ limit: 10, days: 30 });
      setTopProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getLowStock();
      setLowStock(res.data.data || []);
    } catch (err) {
      console.error(err);
      setLowStock([]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Báo cáo</h1>
        <p className="page-subtitle">Thống kê doanh thu, sản phẩm bán chạy và tồn kho</p>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'revenue' as const, label: '📈 Doanh thu' },
          { key: 'top' as const, label: '🏆 Bán chạy' },
          { key: 'stock' as const, label: '📦 Tồn kho' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : tab === 'revenue' ? (
        <>
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Biểu đồ doanh thu</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tổng: <span className="font-bold text-primary-600">{totalRevenue.toLocaleString('vi-VN')} ₫</span>
                </p>
              </div>
              <select
                value={revenueDays}
                onChange={(e) => setRevenueDays(Number(e.target.value))}
                className="input-field w-32"
              >
                <option value={7}>7 ngày</option>
                <option value={30}>30 ngày</option>
                <option value={90}>90 ngày</option>
              </select>
            </div>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </>
      ) : tab === 'top' ? (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top sản phẩm bán chạy (30 ngày)</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="product_name" tick={{ fontSize: 11 }} width={150} />
                <Tooltip />
                <Bar dataKey="total_sold" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              Chưa có dữ liệu bán hàng
            </div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm tồn kho thấp</h3>
          {lowStock.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <span className="text-3xl block mb-2">✅</span>
              Tất cả sản phẩm đều đủ tồn kho
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tồn kho</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ngưỡng min</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStock.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600">{p.stock_quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.min_stock_level}</td>
                    <td className="px-4 py-3">
                      {p.stock_quantity <= 0 ? (
                        <span className="badge-danger">Hết hàng</span>
                      ) : (
                        <span className="badge-warning">Tồn thấp</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
