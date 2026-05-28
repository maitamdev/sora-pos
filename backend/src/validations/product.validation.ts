import { z } from 'zod';

const optionalUuid = z
  .union([z.string().uuid(), z.literal(''), z.null()])
  .optional()
  .transform((value) => value || undefined);

const optionalImage = z
  .union([z.string().url(), z.string().startsWith('data:image/'), z.literal(''), z.null()])
  .optional()
  .transform((value) => value || undefined);

const numberField = (message: string) =>
  z.coerce.number({ invalid_type_error: message }).min(0, message);

const intField = (message: string) =>
  z.coerce.number({ invalid_type_error: message }).int(message).min(0, message);

const normalizeProduct = <T extends Record<string, unknown>>(data: T) => {
  const status = data.status as 'active' | 'inactive' | undefined;
  const costPrice = data.cost_price ?? data.import_price;
  const sellPrice = data.sell_price ?? data.selling_price;

  return {
    ...data,
    cost_price: costPrice,
    sell_price: sellPrice,
    is_active: status ? status === 'active' : data.is_active,
  };
};

export const createProductSchema = z
  .object({
    sku: z.string().trim().min(1, 'SKU khong duoc de trong'),
    barcode: z.string().trim().optional(),
    name: z.string().trim().min(1, 'Ten san pham khong duoc de trong'),
    description: z.string().optional(),
    category_id: optionalUuid,
    supplier_id: optionalUuid,
    import_price: numberField('Gia nhap phai >= 0').optional(),
    selling_price: numberField('Gia ban phai > 0').optional(),
    cost_price: numberField('Gia nhap phai >= 0').optional(),
    sell_price: numberField('Gia ban phai > 0').optional(),
    stock_quantity: intField('Ton kho phai >= 0').optional().default(0),
    min_stock_level: intField('Nguong canh bao ton thap phai >= 0').optional().default(10),
    unit: z.string().trim().optional().default('cai'),
    status: z.enum(['active', 'inactive']).optional().default('active'),
    image_url: optionalImage,
  })
  .refine((data) => data.sell_price !== undefined || data.selling_price !== undefined, {
    path: ['selling_price'],
    message: 'Gia ban la bat buoc',
  })
  .refine((data) => (data.sell_price ?? data.selling_price ?? 0) > 0, {
    path: ['selling_price'],
    message: 'Gia ban phai > 0',
  })
  .transform(normalizeProduct);

export const updateProductSchema = z
  .object({
    sku: z.string().trim().min(1).optional(),
    barcode: z.string().trim().optional(),
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    category_id: optionalUuid,
    supplier_id: optionalUuid,
    import_price: numberField('Gia nhap phai >= 0').optional(),
    selling_price: numberField('Gia ban phai > 0').optional(),
    cost_price: numberField('Gia nhap phai >= 0').optional(),
    sell_price: numberField('Gia ban phai > 0').optional(),
    stock_quantity: intField('Ton kho phai >= 0').optional(),
    min_stock_level: intField('Nguong canh bao ton thap phai >= 0').optional(),
    unit: z.string().trim().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    image_url: optionalImage,
    is_active: z.boolean().optional(),
  })
  .refine((data) => {
    const sellingPrice = data.sell_price ?? data.selling_price;
    return sellingPrice === undefined || sellingPrice > 0;
  }, {
    path: ['selling_price'],
    message: 'Gia ban phai > 0',
  })
  .transform(normalizeProduct);

export type CreateProductSchemaInput = z.infer<typeof createProductSchema>;
export type UpdateProductSchemaInput = z.infer<typeof updateProductSchema>;
