import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU không được để trống'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  cost_price: z.number().min(0, 'Giá nhập phải >= 0'),
  sell_price: z.number().min(0, 'Giá bán phải >= 0'),
  stock_quantity: z.number().int().min(0).optional(),
  min_stock_level: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  image_url: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
