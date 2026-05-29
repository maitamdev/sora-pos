import api from './api';
import { ApiResponse, User, UserRole } from '../types/user.type';

export interface EmployeePayload {
  email?: string;
  password?: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active?: boolean;
}

export const employeeAPI = {
  getAll: () => api.get<ApiResponse<User[]>>('/employees'),
  create: (payload: EmployeePayload & { email: string; password: string }) =>
    api.post<ApiResponse<User>>('/employees', payload),
  update: (id: string, payload: Partial<EmployeePayload>) =>
    api.put<ApiResponse<User>>(`/employees/${id}`, payload),
  deactivate: (id: string) => api.delete<ApiResponse<null>>(`/employees/${id}`),
};
