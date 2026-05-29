import { z } from 'zod';

export const employeeRoleSchema = z.enum(['admin', 'manager', 'cashier']);

export const createEmployeeSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim().toLowerCase(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  full_name: z.string().min(2, 'Tên nhân viên phải có ít nhất 2 ký tự').trim(),
  phone: z.string().trim().optional().or(z.literal('')),
  role: employeeRoleSchema,
  is_active: z.boolean().optional().default(true),
});

export const updateEmployeeSchema = z.object({
  full_name: z.string().min(2, 'Tên nhân viên phải có ít nhất 2 ký tự').trim().optional(),
  phone: z.string().trim().optional().or(z.literal('')),
  role: employeeRoleSchema.optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
