import { useState } from 'react';
import { aiAPI } from '../../services/ai.api';
import { AIRecommendation } from '../../types/ai.type';

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await aiAPI.recommendRestock({ target_days: 14 });
      const data = res.data.data;
      setRecommendations(data?.recommendations || []);
      setAiInsight(data?.ai_insight || '');
      setHasGenerated(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Lỗi tạo gợi ý nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  const priorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="badge-danger">Cao</span>;
      case 'medium': return <span className="badge-warning">Trung bình</span>;
      case 'low': return <span className="badge-success">Thấp</span>;
      default: return <span className="text-sm">{priority}</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">🤖 AI Gợi ý nhập hàng</h1>
          <p className="page-subtitle">
            Phân tích dữ liệu bán hàng và tự động gợi ý số lượng nhập kho tối ưu
          </p>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? '⏳ Đang phân tích...' : '🔄 Tạo gợi ý mới'}
        </button>
      </div>

      {/* Formula Info */}
      <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📐 Công thức tính</h3>
        <code className="text-sm text-blue-800 bg-blue-100 px-3 py-1 rounded">
          recommended_quantity = average_daily_sales × target_days - current_stock
        </code>
        <p className="text-sm text-blue-700 mt-2">
          Mặc định: target_days = 14 ngày | Dựa trên dữ liệu bán hàng 30 ngày gần đây
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="card mb-6 bg-red-50 border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* AI Insight */}
      {aiInsight && (
        <div className="card mb-6 border-l-4 border-l-purple-500">
          <h3 className="font-semibold text-gray-900 mb-2">💡 AI Insight (Groq)</h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="card overflow-hidden">
        <h3 className="font-semibold text-gray-900 mb-4">
          Danh sách gợi ý {recommendations.length > 0 && `(${recommendations.length} SP)`}
        </h3>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tồn kho</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Min</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">TB/ngày</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Gợi ý nhập</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ưu tiên</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lý do</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!hasGenerated ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Nhấn "Tạo gợi ý mới" để AI phân tích và đưa ra gợi ý nhập hàng
                </td>
              </tr>
            ) : recommendations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <span className="text-3xl block mb-2">✅</span>
                  Không có sản phẩm nào cần nhập thêm
                </td>
              </tr>
            ) : (
              recommendations.map((r) => (
                <tr key={r.product_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.product_name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">{r.current_stock}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.min_stock_level}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.average_daily_sales.toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-600">+{r.recommended_quantity}</td>
                  <td className="px-4 py-3">{priorityBadge(r.priority)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{r.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
