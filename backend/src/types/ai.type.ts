export type AIPriority = 'low' | 'medium' | 'high';

export interface AIRecommendation {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  average_daily_sales: number;
  recommended_quantity: number;
  priority: AIPriority;
  reason: string;
  ai_insight: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Input cho API gợi ý nhập hàng
export interface RestockRecommendationInput {
  target_days?: number; // Mặc định 14 ngày
  product_ids?: string[]; // Nếu không truyền, tính cho tất cả sản phẩm
}

// Output tính toán gợi ý
export interface RestockCalculation {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  average_daily_sales: number;
  recommended_quantity: number;
  priority: AIPriority;
  reason: string;
}
