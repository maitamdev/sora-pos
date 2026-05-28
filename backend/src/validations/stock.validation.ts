import { z } from 'zod';

export const stockImportSchema = z.object({
  product_id: z.string().uuid('Product ID không hợp lệ'),
  quantity: z.number().int().min(1, 'Số lượng nhập phải >= 1'),
  note: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
  product_id: z.string().uuid('Product ID không hợp lệ'),
  new_quantity: z.number().int().min(0, 'Số lượng mới phải >= 0'),
  reason: z.string().min(1, 'Lý do điều chỉnh không được để trống'),
});

export type StockImportSchemaInput = z.infer<typeof stockImportSchema>;
export type StockAdjustmentSchemaInput = z.infer<typeof stockAdjustmentSchema>;
