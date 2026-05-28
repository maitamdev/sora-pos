import { create } from 'zustand';
import { CartItem, PaymentMethod } from '../types/order.type';
import { Product } from '../types/product.type';

interface CartState {
  items: CartItem[];
  customerId: string | null;
  paymentMethod: PaymentMethod;
  discountAmount: number;
  receivedAmount: number;
  note: string;

  // Computed (sẽ tính trong component hoặc getter)
  totalAmount: number;
  finalAmount: number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  setCustomer: (customerId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setDiscountAmount: (amount: number) => void;
  setReceivedAmount: (amount: number) => void;
  setNote: (note: string) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[], discountAmount: number) => {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const finalAmount = totalAmount - discountAmount;
  return { totalAmount, finalAmount };
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  customerId: null,
  paymentMethod: 'cash',
  discountAmount: 0,
  receivedAmount: 0,
  note: '',
  totalAmount: 0,
  finalAmount: 0,

  addItem: (product, quantity = 1) =>
    set((state) => {
      const existingIndex = state.items.findIndex((i) => i.product_id === product.id);

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        // Tăng số lượng nếu đã có
        newItems = state.items.map((item, index) => {
          if (index === existingIndex) {
            const newQty = item.quantity + quantity;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unit_price - item.discount,
            };
          }
          return item;
        });
      } else {
        // Thêm mới
        const newItem: CartItem = {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          unit_price: product.sell_price,
          quantity,
          discount: 0,
          subtotal: quantity * product.sell_price,
          stock_quantity: product.stock_quantity,
        };
        newItems = [...state.items, newItem];
      }

      const { totalAmount, finalAmount } = calculateTotals(newItems, state.discountAmount);
      return { items: newItems, totalAmount, finalAmount };
    }),

  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.product_id !== productId);
      const { totalAmount, finalAmount } = calculateTotals(newItems, state.discountAmount);
      return { items: newItems, totalAmount, finalAmount };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const newItems = state.items.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.unit_price - item.discount,
          };
        }
        return item;
      });
      const { totalAmount, finalAmount } = calculateTotals(newItems, state.discountAmount);
      return { items: newItems, totalAmount, finalAmount };
    }),

  updateItemDiscount: (productId, discount) =>
    set((state) => {
      const newItems = state.items.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            discount,
            subtotal: item.quantity * item.unit_price - discount,
          };
        }
        return item;
      });
      const { totalAmount, finalAmount } = calculateTotals(newItems, state.discountAmount);
      return { items: newItems, totalAmount, finalAmount };
    }),

  setCustomer: (customerId) => set({ customerId }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setDiscountAmount: (amount) =>
    set((state) => {
      const { totalAmount, finalAmount } = calculateTotals(state.items, amount);
      return { discountAmount: amount, totalAmount, finalAmount };
    }),
  setReceivedAmount: (amount) => set({ receivedAmount: amount }),
  setNote: (note) => set({ note }),

  clearCart: () =>
    set({
      items: [],
      customerId: null,
      paymentMethod: 'cash',
      discountAmount: 0,
      receivedAmount: 0,
      note: '',
      totalAmount: 0,
      finalAmount: 0,
    }),
}));
