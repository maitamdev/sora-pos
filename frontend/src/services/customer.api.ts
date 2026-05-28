import api from './api';
import { ApiResponse } from '../types/user.type';
import { Customer } from '../types/product.type';

export const customerAPI = {
  getAll: (params?: { search?: string }) =>
    api.get<ApiResponse<Customer[]>>('/customers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Customer>>(`/customers/${id}`),

  create: (data: { name: string; phone?: string; email?: string; address?: string }) =>
    api.post<ApiResponse<Customer>>('/customers', data),

  update: (id: string, data: Partial<{ name: string; phone: string; email: string; address: string }>) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data),
};
