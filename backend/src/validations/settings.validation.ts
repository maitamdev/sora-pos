import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    store_name: z.string().trim().min(1, 'Tên cửa hàng không được để trống').optional(),
    store_address: z.string().trim().optional(),
    store_phone: z.string().trim().optional(),
    store_tax_code: z.string().trim().optional(),
    receipt_footer: z.string().trim().optional(),
    default_payment_method: z.enum(['cash', 'bank_transfer', 'e_wallet', 'qr_mock']).optional(),
    require_customer: z.boolean().optional(),
    hide_out_of_stock: z.boolean().optional(),
    show_product_images: z.boolean().optional(),
    auto_print_receipt: z.boolean().optional(),
    max_discount_percent: z.number().min(0).max(100).optional(),
  }),
});
