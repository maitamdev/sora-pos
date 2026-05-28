import { AIPriority } from '../types/ai.type';

/**
 * Tính số lượng gợi ý nhập hàng
 * Công thức: recommended_quantity = average_daily_sales * target_days - current_stock
 *
 * @param averageDailySales - Số lượng bán trung bình mỗi ngày
 * @param targetDays - Số ngày dự trữ mục tiêu (mặc định 14)
 * @param currentStock - Tồn kho hiện tại
 * @returns Số lượng cần nhập (tối thiểu 0)
 */
export const calculateRecommendedQuantity = (
  averageDailySales: number,
  targetDays: number = 14,
  currentStock: number
): number => {
  const recommended = Math.ceil(averageDailySales * targetDays - currentStock);
  return Math.max(0, recommended); // Không trả về số âm
};

/**
 * Xác định mức độ ưu tiên nhập hàng
 * - high: tồn kho = 0 hoặc <= 20% min_stock_level
 * - medium: tồn kho <= min_stock_level
 * - low: tồn kho > min_stock_level nhưng vẫn nên nhập thêm
 */
export const calculatePriority = (
  currentStock: number,
  minStockLevel: number
): AIPriority => {
  if (currentStock === 0 || currentStock <= minStockLevel * 0.2) {
    return 'high';
  }
  if (currentStock <= minStockLevel) {
    return 'medium';
  }
  return 'low';
};

/**
 * Tạo mã hóa đơn tự động
 * Format: ORD-YYYYMMDD-XXX (XXX: số thứ tự trong ngày)
 */
export const generateOrderNumber = (sequence: number = 1): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seqStr = String(sequence).padStart(3, '0');
  return `ORD-${dateStr}-${seqStr}`;
};
