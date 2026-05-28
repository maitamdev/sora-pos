import { z } from 'zod';

const optionalImage = z
  .union([z.string().url(), z.string().startsWith('data:image/'), z.literal('')])
  .optional();

export const productSchema = z.object({
  sku: z.string().trim().min(1, 'SKU khong duoc de trong'),
  barcode: z.string().optional(),
  name: z.string().trim().min(1, 'Ten san pham khong duoc de trong'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  cost_price: z.coerce.number().min(0, 'Gia nhap phai >= 0'),
  sell_price: z.coerce.number().min(0.01, 'Gia ban phai > 0'),
  stock_quantity: z.coerce.number().int().min(0, 'Ton kho phai >= 0').optional(),
  min_stock_level: z.coerce.number().int().min(0, 'Nguong ton thap phai >= 0').optional(),
  unit: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  image_url: optionalImage,
});

export type ProductFormData = z.infer<typeof productSchema>;
