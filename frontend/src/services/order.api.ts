import api from './api';
import { ApiResponse } from '../types/user.type';
import { CreateOrderPayload, Order, OrderResult } from '../types/order.type';

export const orderAPI = {
  create: (data: CreateOrderPayload) =>
    api.post<ApiResponse<OrderResult>>('/orders', data),

  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ orders: Order[]; total: number; page: number; limit: number }>>('/orders', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<OrderResult>>(`/orders/${id}`),
};
