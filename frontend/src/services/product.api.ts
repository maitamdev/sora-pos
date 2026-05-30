import api from './api';
import { Product, ProductFilters } from '../types/product.type';
import { ApiResponse } from '../types/user.type';
import { ProductFormData } from '../validations/product.schema';

export interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getProducts = (params?: ProductFilters) =>
  api.get<ApiResponse<GetProductsResponse>>('/products', { params });

export const getProductById = (id: string) =>
  api.get<ApiResponse<Product>>(`/products/${id}`);

export const createProduct = (data: ProductFormData) =>
  api.post<ApiResponse<Product>>('/products', data);

export const updateProduct = (id: string, data: Partial<ProductFormData>) =>
  api.put<ApiResponse<Product>>(`/products/${id}`, data);

export const deleteProduct = (id: string) =>
  api.delete<ApiResponse<null>>(`/products/${id}`);

export const productAPI = {
  getAll: getProducts,
  getById: getProductById,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  getQrCode: (id: string) => api.get<ApiResponse<{ qr_code: string }>>(`/products/${id}/qr`),
};
