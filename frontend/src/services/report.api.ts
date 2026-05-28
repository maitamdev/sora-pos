import api from './api';

export const reportAPI = {
  getDashboard: () =>
    api.get('/reports/dashboard'),

  getTopProducts: (params?: { limit?: number; days?: number }) =>
    api.get('/reports/top-products', { params }),

  getRevenue: (params?: { days?: number }) =>
    api.get('/reports/revenue', { params }),

  getLowStock: () =>
    api.get('/reports/low-stock'),
};
