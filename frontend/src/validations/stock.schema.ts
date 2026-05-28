import { z } from 'zod';

export const stockImportSchema = z.object({
  product_id: z.string().min(1, 'Chọn sản phẩm'),
  quantity: z.number().int().min(1, 'Số lượng nhập phải >= 1'),
  note: z.string().optional(),
});

export type StockImportFormData = z.infer<typeof stockImportSchema>;
