import api from './api';
import { ApiResponse } from '../types/user.type';
import { POSSettings } from '../stores/settings.store';

export interface BackendSettings {
  id?: string;
  store_id?: string;
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
}

export const mapToFrontend = (b: BackendSettings): POSSettings => ({
  storeName: b.store_name || '',
  storeAddress: b.store_address || '',
  storePhone: b.store_phone || '',
  storeTaxCode: b.store_tax_code || '',
  receiptFooter: b.receipt_footer || '',
  defaultPaymentMethod: b.default_payment_method as any || 'cash',
  requireCustomer: !!b.require_customer,
  hideOutOfStock: !!b.hide_out_of_stock,
  showProductImages: b.show_product_images !== false, // default true
  autoPrintReceipt: !!b.auto_print_receipt,
  maxDiscountPercent: b.max_discount_percent !== undefined ? Number(b.max_discount_percent) : 100,
});

export const mapToBackend = (f: POSSettings): Partial<BackendSettings> => ({
  store_name: f.storeName,
  store_address: f.storeAddress,
  store_phone: f.storePhone,
  store_tax_code: f.storeTaxCode,
  receipt_footer: f.receiptFooter,
  default_payment_method: f.defaultPaymentMethod,
  require_customer: f.requireCustomer,
  hide_out_of_stock: f.hideOutOfStock,
  show_product_images: f.showProductImages,
  auto_print_receipt: f.autoPrintReceipt,
  max_discount_percent: f.maxDiscountPercent,
});

export const settingsAPI = {
  get: () =>
    api.get<ApiResponse<BackendSettings>>('/settings'),

  update: (data: POSSettings) =>
    api.put<ApiResponse<BackendSettings>>('/settings', mapToBackend(data)),
};
