import api from './api';
import { Product } from '../types/product.type';
import { ApiResponse } from '../types/user.type';

export interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<GetProductsResponse>>('/products', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  create: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/products/${id}`),
};
