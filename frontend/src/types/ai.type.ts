export type AIPriority = 'low' | 'medium' | 'high';

export interface AIRecommendation {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  average_daily_sales: number;
  recommended_quantity: number;
  priority: AIPriority;
  reason: string;
  ai_insight?: string;
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  ai_insight: string;
  total: number;
}
