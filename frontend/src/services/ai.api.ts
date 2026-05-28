import api from './api';
import { ApiResponse } from '../types/user.type';

export interface AIProductRecognitionResponse {
  name?: string;
  description?: string;
  sku_prefix?: string;
  suggested_price?: number;
  category_id?: string;
}

export const aiAPI = {
  recommendRestock: (data?: { target_days?: number; product_ids?: string[] }) =>
    api.post('/ai/recommend-restock', data || {}),

  getHistory: () =>
    api.get('/ai/recommendations'),

  recognizeProduct: (data: { image?: string; productName?: string }) =>
    api.post<ApiResponse<AIProductRecognitionResponse>>('/ai/recognize-product', data),
};
