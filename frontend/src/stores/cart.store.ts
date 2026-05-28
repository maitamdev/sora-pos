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
  subtotal: number;
  discount: number;
  total: number;
  totalAmount: number;
  finalAmount: number;

  addItem: (product: Product, quantity?: number) => { ok: boolean; message?: string };
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => { ok: boolean; message?: string };
  decreaseQuantity: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { ok: boolean; message?: string };
  updateItemDiscount: (productId: string, discount: number) => void;
  setCustomer: (customerId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setDiscountAmount: (amount: number) => void;
  setReceivedAmount: (amount: number) => void;
  setNote: (note: string) => void;
  clearCart: () => void;
}

const clampDiscount = (amount: number, subtotal: number) => Math.min(Math.max(amount || 0, 0), subtotal);

const calculateTotals = (items: CartItem[], discountAmount: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = clampDiscount(discountAmount, subtotal);
  const total = Math.max(subtotal - discount, 0);
  return { subtotal, discount, total, totalAmount: subtotal, finalAmount: total };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  paymentMethod: 'cash',
  discountAmount: 0,
  receivedAmount: 0,
  note: '',
  subtotal: 0,
  discount: 0,
  total: 0,
  totalAmount: 0,
  finalAmount: 0,

  addItem: (product, quantity = 1) => {
    const state = get();
    const existing = state.items.find((item) => item.product_id === product.id);
    const nextQuantity = (existing?.quantity || 0) + quantity;

    if (product.stock_quantity <= 0) {
      return { ok: false, message: `${product.name} da het hang` };
    }
    if (nextQuantity > product.stock_quantity) {
      return { ok: false, message: `${product.name}: khong du ton kho (con ${product.stock_quantity})` };
    }

    set((current) => {
      const items = existing
        ? current.items.map((item) =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: nextQuantity,
                  subtotal: nextQuantity * item.unit_price - item.discount,
                }
              : item
          )
        : [
            ...current.items,
            {
              product_id: product.id,
              product_name: product.name,
              sku: product.sku,
              unit_price: Number(product.sell_price || 0),
              quantity,
              discount: 0,
              subtotal: quantity * Number(product.sell_price || 0),
              stock_quantity: product.stock_quantity,
              image_url: product.image_url,
              unit: product.unit,
            },
          ];

      return { items, ...calculateTotals(items, current.discountAmount) };
    });

    return { ok: true };
  },

  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((item) => item.product_id !== productId);
      return { items, ...calculateTotals(items, state.discountAmount) };
    }),

  increaseQuantity: (productId) => {
    const item = get().items.find((cartItem) => cartItem.product_id === productId);
    if (!item) return { ok: false, message: 'San pham khong co trong gio' };
    return get().updateQuantity(productId, item.quantity + 1);
  },

  decreaseQuantity: (productId) => {
    const item = get().items.find((cartItem) => cartItem.product_id === productId);
    if (!item) return;
    if (item.quantity <= 1) {
      get().removeItem(productId);
      return;
    }
    get().updateQuantity(productId, item.quantity - 1);
  },

  updateQuantity: (productId, quantity) => {
    const item = get().items.find((cartItem) => cartItem.product_id === productId);
    if (!item) return { ok: false, message: 'San pham khong co trong gio' };
    const nextQuantity = Math.max(1, Math.floor(quantity || 1));
    if (nextQuantity > item.stock_quantity) {
      return { ok: false, message: `${item.product_name}: khong du ton kho (con ${item.stock_quantity})` };
    }

    set((state) => {
      const items = state.items.map((cartItem) =>
        cartItem.product_id === productId
          ? {
              ...cartItem,
              quantity: nextQuantity,
              subtotal: nextQuantity * cartItem.unit_price - cartItem.discount,
            }
          : cartItem
      );
      return { items, ...calculateTotals(items, state.discountAmount) };
    });

    return { ok: true };
  },

  updateItemDiscount: (productId, discount) =>
    set((state) => {
      const items = state.items.map((item) => {
        if (item.product_id !== productId) return item;
        const lineTotal = item.quantity * item.unit_price;
        const lineDiscount = clampDiscount(discount, lineTotal);
        return {
          ...item,
          discount: lineDiscount,
          subtotal: lineTotal - lineDiscount,
        };
      });
      return { items, ...calculateTotals(items, state.discountAmount) };
    }),

  setCustomer: (customerId) => set({ customerId }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setDiscountAmount: (amount) =>
    set((state) => {
      const totals = calculateTotals(state.items, amount);
      return { discountAmount: totals.discount, ...totals };
    }),
  setReceivedAmount: (amount) => set({ receivedAmount: Math.max(amount || 0, 0) }),
  setNote: (note) => set({ note }),

  clearCart: () =>
    set({
      items: [],
      customerId: null,
      paymentMethod: 'cash',
      discountAmount: 0,
      receivedAmount: 0,
      note: '',
      subtotal: 0,
      discount: 0,
      total: 0,
      totalAmount: 0,
      finalAmount: 0,
    }),
}));
