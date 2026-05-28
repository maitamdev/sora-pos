import api from './api';
import { ApiResponse } from '../types/user.type';
import { CreateOrderPayload, GetOrdersResponse, Order, OrderFilters, OrderResult } from '../types/order.type';

export const getOrders = (params?: OrderFilters) =>
  api.get<ApiResponse<GetOrdersResponse>>('/orders', { params });

export const getOrderById = (id: string) =>
  api.get<ApiResponse<OrderResult>>(`/orders/${id}`);

export const createOrder = (data: CreateOrderPayload) =>
  api.post<ApiResponse<OrderResult>>('/orders', data);

export const cancelOrder = (id: string) =>
  api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);

export const downloadInvoicePdf = (id: string) =>
  api.get<Blob>(`/orders/${id}/pdf`, { responseType: 'blob' });

export const orderAPI = {
  create: createOrder,
  getAll: getOrders,
  getById: getOrderById,
  cancel: cancelOrder,
  downloadPdf: downloadInvoicePdf,
};
