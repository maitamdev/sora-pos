export interface StoreSettings {
  id?: string;
  store_id: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  store_tax_code: string;
  receipt_footer: string;
  default_payment_method: string;
  require_customer: boolean;
  hide_out_of_stock: boolean;
  show_product_images: boolean;
  auto_print_receipt: boolean;
  max_discount_percent: number;
  created_at?: string;
  updated_at?: string;
}

export type UpdateStoreSettingsInput = Partial<Omit<StoreSettings, 'id' | 'store_id' | 'created_at' | 'updated_at'>>;
