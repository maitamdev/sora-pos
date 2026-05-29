import { z } from 'zod';

const optionalImage = z
  .union([z.string().url(), z.string().startsWith('data:image/'), z.literal('')])
  .optional();

export const productSchema = z.object({
  sku: z.string().trim().min(1, 'SKU không được để trống'),
  barcode: z.string().optional(),
  name: z.string().trim().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  cost_price: z.coerce.number().min(0, 'Giá nhập phải >= 0'),
  sell_price: z.coerce.number().min(0.01, 'Giá bán phải > 0'),
  stock_quantity: z.coerce.number().int().min(0, 'Tồn kho phải >= 0').optional(),
  min_stock_level: z.coerce.number().int().min(0, 'Ngưỡng tồn thấp phải >= 0').optional(),
  unit: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  image_url: optionalImage,
});

export type ProductFormData = z.infer<typeof productSchema>;
