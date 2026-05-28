import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Category } from '../../types/product.type';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setCategories([]);
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
          <h1 className="page-title">Quản lý danh mục</h1>
          <p className="page-subtitle">Phân loại sản phẩm theo danh mục</p>
        </div>
        <button className="btn-primary">+ Thêm danh mục</button>
      </div>

      {categories.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-4xl mb-3">🏷️</span>
          <p className="font-medium">Chưa có danh mục nào</p>
          <p className="text-sm">Nhấn "Thêm danh mục" để tạo danh mục mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-xl">
                  🏷️
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.description || 'Không có mô tả'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
