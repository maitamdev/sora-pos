import { z } from 'zod';

const orderItemSchema = z.object({
  product_id: z.string().uuid('Product ID không hợp lệ'),
  quantity: z.number().int().min(1, 'Số lượng phải >= 1'),
  unit_price: z.number().min(0, 'Đơn giá phải >= 0'),
  discount: z.number().min(0).optional().default(0),
});

export const createOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
  discount_amount: z.number().min(0).optional().default(0),
  payment_method: z.enum(['cash', 'card', 'transfer', 'momo', 'zalopay']),
  received_amount: z.number().min(0, 'Số tiền nhận phải >= 0'),
  note: z.string().optional(),
});

export type CreateOrderSchemaInput = z.infer<typeof createOrderSchema>;
