import { z } from 'zod';

const orderItemSchema = z.object({
  product_id: z.string().uuid('Product ID khong hop le'),
  quantity: z.coerce.number().int().min(1, 'So luong phai >= 1'),
  unit_price: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional().default(0),
});

export const createOrderSchema = z.object({
  customer_id: z
    .union([z.string().uuid(), z.literal(''), z.null()])
    .optional()
    .transform((value) => value || undefined),
  items: z.array(orderItemSchema).min(1, 'Don hang phai co it nhat 1 san pham'),
  discount_amount: z.coerce.number().min(0).optional().default(0),
  payment_method: z.enum([
    'cash',
    'bank_transfer',
    'e_wallet',
    'qr_mock',
    'card',
    'transfer',
    'momo',
    'zalopay',
  ]),
  received_amount: z.coerce.number().min(0, 'So tien nhan phai >= 0').optional().default(0),
  note: z.string().optional(),
});

export type CreateOrderSchemaInput = z.infer<typeof createOrderSchema>;
