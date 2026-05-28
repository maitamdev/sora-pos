import api from './api';

export const orderAPI = {
  create: (data: Record<string, unknown>) =>
    api.post('/orders', data),

  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/orders', { params }),

  getById: (id: string) =>
    api.get(`/orders/${id}`),
};
