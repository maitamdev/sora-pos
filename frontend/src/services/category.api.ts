import api from './api';
import { ApiResponse } from '../types/user.type';
import { Category } from '../types/product.type';

export const categoryAPI = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/categories'),
};
