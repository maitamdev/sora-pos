import { z } from 'zod';

export const orderSchema = z.object({
  customer_id: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0),
    discount: z.number().min(0).optional(),
  })).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
  discount_amount: z.number().min(0).optional(),
  payment_method: z.enum(['cash', 'card', 'transfer', 'momo', 'zalopay']),
  received_amount: z.number().min(0),
  note: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;
