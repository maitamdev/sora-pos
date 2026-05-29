import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentMethod } from '../types/order.type';

export interface POSSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeTaxCode: string;
  receiptFooter: string;
  defaultPaymentMethod: PaymentMethod;
  requireCustomer: boolean;
  hideOutOfStock: boolean;
  showProductImages: boolean;
  autoPrintReceipt: boolean;
  maxDiscountPercent: number;
}

interface SettingsState extends POSSettings {
  updateSettings: (settings: Partial<POSSettings>) => void;
  resetSettings: () => void;
}

export const defaultPOSSettings: POSSettings = {
  storeName: 'Sora POS',
  storeAddress: '',
  storePhone: '',
  storeTaxCode: '',
  receiptFooter: 'Cảm ơn quý khách và hẹn gặp lại!',
  defaultPaymentMethod: 'cash',
  requireCustomer: false,
  hideOutOfStock: false,
  showProductImages: true,
  autoPrintReceipt: false,
  maxDiscountPercent: 100,
};

const normalizeSettings = (settings: Partial<POSSettings>): Partial<POSSettings> => ({
  ...settings,
  maxDiscountPercent:
    settings.maxDiscountPercent === undefined
      ? undefined
      : Math.min(Math.max(Number(settings.maxDiscountPercent) || 0, 0), 100),
});

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultPOSSettings,
      updateSettings: (settings) =>
        set((state) => ({
          ...state,
          ...normalizeSettings(settings),
        })),
      resetSettings: () => set(defaultPOSSettings),
    }),
    {
      name: 'sora-pos-settings',
      partialize: (state) => ({
        storeName: state.storeName,
        storeAddress: state.storeAddress,
        storePhone: state.storePhone,
        storeTaxCode: state.storeTaxCode,
        receiptFooter: state.receiptFooter,
        defaultPaymentMethod: state.defaultPaymentMethod,
        requireCustomer: state.requireCustomer,
        hideOutOfStock: state.hideOutOfStock,
        showProductImages: state.showProductImages,
        autoPrintReceipt: state.autoPrintReceipt,
        maxDiscountPercent: state.maxDiscountPercent,
      }),
    }
  )
);
