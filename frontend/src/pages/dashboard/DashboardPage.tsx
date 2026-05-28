import { useState, useEffect } from 'react';
import { HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineCube, HiOutlineExclamationCircle, HiOutlineUsers } from 'react-icons/hi';
import { reportAPI } from '../../services/report.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  today_revenue: number;
  today_orders: number;
  total_products: number;
  stock_alerts: number;
  total_customers: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
}

interface RevenueDay {
  date: string;
  revenue: number;
}

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, topRes, revRes] = await Promise.allSettled([
        reportAPI.getDashboard(),
        reportAPI.getTopProducts({ limit: 5, days: 30 }),
        reportAPI.getRevenue({ days: 7 }),
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboard(dashRes.value.data.data);
      }
      if (topRes.status === 'fulfilled') {
        setTopProducts(topRes.value.data.data || []);
      }
      if (revRes.status === 'fulfilled') {
        setRevenueData(revRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Doanh thu hôm nay',
      value: dashboard ? `${dashboard.today_revenue.toLocaleString('vi-VN')} ₫` : '—',
      icon: HiOutlineCurrencyDollar,
      color: 'bg-emerald-500',
    },
    {
      title: 'Đơn hàng hôm nay',
      value: dashboard ? String(dashboard.today_orders) : '—',
      icon: HiOutlineShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Tổng sản phẩm',
      value: dashboard ? String(dashboard.total_products) : '—',
      icon: HiOutlineCube,
      color: 'bg-purple-500',
    },
    {
      title: 'Cảnh báo tồn kho',
      value: dashboard ? String(dashboard.stock_alerts) : '—',
      icon: HiOutlineExclamationCircle,
      color: 'bg-amber-500',
    },
    {
      title: 'Tổng khách hàng',
      value: dashboard ? String(dashboard.total_customers) : '—',
      icon: HiOutlineUsers,
      color: 'bg-rose-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Tổng quan hệ thống Sora POS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Doanh thu 7 ngày gần đây</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Top Products Chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm bán chạy (30 ngày)</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topProducts}
                  dataKey="total_sold"
                  nameKey="product_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ product_name, total_sold }) => `${product_name}: ${total_sold}`}
                >
                  {topProducts.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
              Chưa có dữ liệu sản phẩm bán chạy
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
