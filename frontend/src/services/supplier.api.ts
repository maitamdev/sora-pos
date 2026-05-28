import api from './api';
import { ApiResponse } from '../types/user.type';
import { Supplier } from '../types/product.type';

export const supplierAPI = {
  getAll: () =>
    api.get<ApiResponse<Supplier[]>>('/suppliers'),
};
