import api from './api';

export const stockAPI = {
  getAlerts: () =>
    api.get('/stock/alerts'),

  getTransactions: (params?: { product_id?: string; page?: number }) =>
    api.get('/stock/transactions', { params }),

  importStock: (data: { product_id: string; quantity: number; note?: string }) =>
    api.post('/stock/import', data),

  adjustStock: (data: { product_id: string; new_quantity: number; reason: string }) =>
    api.post('/stock/adjust', data),
};
