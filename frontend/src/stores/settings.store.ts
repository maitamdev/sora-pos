import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentMethod } from '../types/order.type';
import { settingsAPI, mapToFrontend } from '../services/settings.api';

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
  updateSettings: (settings: Partial<POSSettings>) => Promise<void>;
  fetchSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
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
    (set, get) => ({
      ...defaultPOSSettings,
      
      updateSettings: async (settings) => {
        const normalized = normalizeSettings(settings);
        // Cập nhật local state trước để UI phản hồi ngay lập tức (optimistic update)
        set((state) => ({ ...state, ...normalized }));
        
        try {
          // Lấy full settings hiện tại để gửi lên backend
          const fullSettings: POSSettings = {
            storeName: get().storeName,
            storeAddress: get().storeAddress,
            storePhone: get().storePhone,
            storeTaxCode: get().storeTaxCode,
            receiptFooter: get().receiptFooter,
            defaultPaymentMethod: get().defaultPaymentMethod,
            requireCustomer: get().requireCustomer,
            hideOutOfStock: get().hideOutOfStock,
            showProductImages: get().showProductImages,
            autoPrintReceipt: get().autoPrintReceipt,
            maxDiscountPercent: get().maxDiscountPercent,
          };
          
          const res = await settingsAPI.update(fullSettings);
          if (res.data?.data) {
            set(mapToFrontend(res.data.data));
          }
        } catch (error) {
          console.error('Error saving settings to backend:', error);
          // Vẫn giữ local state nhưng log lỗi
        }
      },
      
      fetchSettings: async () => {
        try {
          const res = await settingsAPI.get();
          if (res.data?.data) {
            set(mapToFrontend(res.data.data));
          }
        } catch (error) {
          console.error('Error fetching settings from backend:', error);
        }
      },
      
      resetSettings: async () => {
        set(defaultPOSSettings);
        try {
          await settingsAPI.update(defaultPOSSettings);
        } catch (error) {
          console.error('Error resetting settings to backend:', error);
        }
      },
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
