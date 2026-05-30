import api from './api';
import { ApiResponse } from '../types/user.type';
import { Supplier, SupplierFilters, SupplierFormData } from '../types/supplier.type';

export interface PaginatedSuppliers {
  suppliers: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const supplierAPI = {
  getAll: (params?: SupplierFilters) =>
    api.get<ApiResponse<PaginatedSuppliers>>('/suppliers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Supplier>>(`/suppliers/${id}`),

  create: (data: SupplierFormData) =>
    api.post<ApiResponse<Supplier>>('/suppliers', data),

  update: (id: string, data: Partial<SupplierFormData> & { is_active?: boolean }) =>
    api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/suppliers/${id}`),
};
