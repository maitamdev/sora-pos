import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  full_name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phone: z.string().optional(),
  role_id: z.string().uuid('Role ID không hợp lệ'),
});

export const storeRegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  full_name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phone: z.string().optional(),
  store_name: z.string().min(2, 'Tên cửa hàng tối thiểu 2 ký tự').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StoreRegisterInput = z.infer<typeof storeRegisterSchema>;
