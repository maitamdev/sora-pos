import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Tên nhà cung cấp là bắt buộc',
    }).trim().min(1, 'Tên nhà cung cấp không được để trống'),
    contact_person: z.string().trim().optional(),
    email: z.string().trim().email('Email không đúng định dạng').or(z.literal('')).optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    tax_code: z.string().trim().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Tên nhà cung cấp không được để trống').optional(),
    contact_person: z.string().trim().optional(),
    email: z.string().trim().email('Email không đúng định dạng').or(z.literal('')).optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    tax_code: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  }),
});
