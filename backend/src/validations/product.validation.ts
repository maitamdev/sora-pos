import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU không được để trống'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  cost_price: z.number().min(0, 'Giá nhập phải >= 0'),
  sell_price: z.number().min(0, 'Giá bán phải >= 0'),
  stock_quantity: z.number().int().min(0).optional().default(0),
  min_stock_level: z.number().int().min(0).optional().default(10),
  unit: z.string().optional().default('cái'),
  image_url: z.string().url().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  cost_price: z.number().min(0).optional(),
  sell_price: z.number().min(0).optional(),
  min_stock_level: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  image_url: z.string().url().optional().nullable(),
  is_active: z.boolean().optional(),
});

export type CreateProductSchemaInput = z.infer<typeof createProductSchema>;
export type UpdateProductSchemaInput = z.infer<typeof updateProductSchema>;
