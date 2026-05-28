import api from './api';
import { ApiResponse } from '../types/user.type';
import { Customer } from '../types/product.type';

export const customerAPI = {
  getAll: (params?: { search?: string }) =>
    api.get<ApiResponse<Customer[]>>('/customers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Customer>>(`/customers/${id}`),
};
