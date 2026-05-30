import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineDatabase, HiOutlinePlus, HiOutlineAdjustments, HiX, HiChevronRight } from 'react-icons/hi';
import { stockAPI } from '../../services/stock.api';
import { productAPI } from '../../services/product.api';
import { StockAlert, StockTransaction } from '../../types/stock.type';
import { Product } from '../../types/product.type';
import { useAuthStore } from '../../stores/auth.store';

type TabType = 'alerts' | 'transactions';
type ModalType = 'import' | 'adjust';

export default function StockPage() {
  const { hasRole } = useAuthStore();
  const canManage = hasRole('admin', 'manager');

  const [tab, setTab] = useState<TabType>('alerts');
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('import');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [newQuantity, setNewQuantity] = useState(0);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    if (tab === 'alerts') {
      await fetchAlerts();
    } else {
      await fetchTransactions();
    }
  };

  const fetchAlerts = async () => {
    try {
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
      const res = await stockAPI.getTransactions({});
      setTransactions(res.data.data?.transactions || []);
    } catch (err) {
      console.error('Fetch transactions error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await productAPI.getAll({ limit: 100, status: 'active' });
      setProducts(res.data.data?.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  };

  const openModal = async (type: ModalType, productId?: string) => {
    setModalType(type);
    setSelectedProductId(productId || '');
    setQuantity(1);
    setNote('');
    setReason('');
    
    // Fetch products list for the dropdown
    await fetchProductsList();
    
    if (productId && type === 'adjust') {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        setNewQuantity(prod.stock_quantity);
      }
    } else {
      setNewQuantity(0);
    }

    setIsModalOpen(true);
  };

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setNewQuantity(prod.stock_quantity);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProductId('');
    setQuantity(1);
    setNewQuantity(0);
    setNote('');
    setReason('');
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    try {
      setModalSubmitting(true);
      if (modalType === 'import') {
        if (quantity <= 0) {
          toast.error('Số lượng nhập phải lớn hơn 0');
          return;
        }
        await stockAPI.importStock({
          product_id: selectedProductId,
          quantity,
          note: note.trim() || undefined,
        });
        toast.success('Đã nhập kho thành công');
      } else {
        if (newQuantity < 0) {
          toast.error('Số lượng tồn kho mới không được âm');
          return;
        }
        if (!reason.trim()) {
          toast.error('Vui lòng nhập lý do điều chỉnh');
          return;
        }
        await stockAPI.adjustStock({
          product_id: selectedProductId,
          new_quantity: newQuantity,
          reason: reason.trim(),
        });
        toast.success('Đã điều chỉnh tồn kho thành công');
      }
      
      closeModal();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thao tác kho thất bại');
    } finally {
      setModalSubmitting(false);
    }
  };

  const getSelectedProductCurrentStock = () => {
    const prod = products.find(p => p.id === selectedProductId);
    return prod ? prod.stock_quantity : 0;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-800">Quản lý kho hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Nhập hàng vào kho, điều chỉnh tồn kho và xem cảnh báo hàng sắp hết.</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => openModal('adjust')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <HiOutlineAdjustments className="h-5 w-5" />
              Điều chỉnh tồn kho
            </button>
            <button
              onClick={() => openModal('import')}
              className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-transform active:scale-95"
            >
              <HiOutlinePlus className="h-5 w-5" />
              Nhập kho hàng
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('alerts')}
          className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            tab === 'alerts'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          ⚠️ Cảnh báo tồn kho
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            tab === 'transactions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          📊 Lịch sử giao dịch kho
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 border border-slate-100 bg-white shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : tab === 'alerts' ? (
        /* Stock Alerts */
        <div className="border border-slate-100 bg-white shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-4 text-base">Sản phẩm dưới ngưỡng an toàn</h3>
          {alerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <span className="text-4xl block mb-3">✅</span>
              <p className="font-medium text-slate-600">Không có cảnh báo tồn kho nào</p>
              <p className="text-sm mt-1 text-slate-400">Tất cả sản phẩm đều có số lượng tồn kho an toàn.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        alert.status === 'out_of_stock' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {alert.products?.name || 'Sản phẩm không xác định'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        SKU: <span className="font-mono text-slate-700 font-medium">{alert.products?.sku}</span> ・ Tồn: {' '}
                        <span className="font-bold text-red-600">{alert.current_stock}</span> / Min: {alert.min_stock_level} ・ {alert.products?.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={alert.status === 'out_of_stock' ? 'badge-danger text-xs' : 'badge-warning text-xs'}>
                      {alert.status === 'out_of_stock' ? 'Hết hàng' : 'Tồn thấp'}
                    </span>
                    {canManage && (
                      <button
                        onClick={() => openModal('import', alert.product_id)}
                        className="rounded border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        title="Nhập thêm"
                      >
                        <HiOutlinePlus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Transactions */
        <div className="overflow-hidden border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại giao dịch</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trước {"->"} Sau</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ghi chú / Lý do</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Người thực hiện</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                        <HiOutlineDatabase className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-600">Chưa có giao dịch kho nào</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{t.products?.name || '—'}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">{t.products?.sku || ''}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            t.type === 'import'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : t.type === 'sale'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : t.type === 'return'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {t.type === 'import' ? 'Nhập kho' : t.type === 'sale' ? 'Bán hàng' : t.type === 'return' ? 'Trả hàng' : 'Điều chỉnh'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-sm">
                        <span className={t.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>{t.previous_stock}</span>
                          <HiChevronRight className="h-3 w-3 text-slate-300" />
                          <span className="font-bold text-slate-800">{t.new_stock}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate" title={t.note || '—'}>
                        {t.note || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {t.users?.full_name || '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(t.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white p-5 shadow-2xl rounded-lg animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalType === 'import' ? 'Nhập thêm kho hàng' : 'Điều chỉnh số lượng tồn kho'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {modalType === 'import' ? 'Tăng lượng tồn kho cho sản phẩm đã chọn.' : 'Đặt lại giá trị tồn kho chính xác.'}
                </p>
              </div>
              <button onClick={closeModal} className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
                <HiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="space-y-4 pt-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Chọn sản phẩm *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="input-field bg-white"
                  required
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - Tồn hiện tại: {p.stock_quantity}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductId && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 flex justify-between">
                  <span>Tồn kho hiện tại:</span>
                  <span className="font-bold text-slate-800">{getSelectedProductCurrentStock()} sản phẩm</span>
                </div>
              )}

              {modalType === 'import' ? (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Số lượng nhập thêm *</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="input-field"
                    placeholder="Nhập số lượng hàng thêm vào"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Số lượng tồn kho thực tế *</label>
                  <input
                    type="number"
                    min={0}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="input-field"
                    placeholder="Nhập số lượng tồn thực tế đo được"
                    required
                  />
                </div>
              )}

              {modalType === 'import' ? (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Ghi chú nhập kho</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="input-field resize-none"
                    placeholder="Ví dụ: Nhập hàng đợt cuối tháng 5..."
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Lý do điều chỉnh *</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="input-field resize-none"
                    placeholder="Ví dụ: Kiểm hàng phát hiện sai lệch, hư hỏng sản phẩm..."
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="btn-primary px-5 disabled:opacity-50 transition-all"
                >
                  {modalSubmitting ? 'Đang thực hiện...' : modalType === 'import' ? 'Nhập kho' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
