export type OrderStatus = 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'e_wallet'
  | 'qr_mock'
  | 'card'
  | 'transfer'
  | 'momo'
  | 'zalopay';

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  received_amount: number;
  change_amount: number;
  reference_code?: string;
  status: string;
  created_at: string;
}

// Input từ frontend khi tạo hóa đơn
export interface CreateOrderInput {
  customer_id?: string;
  items: CreateOrderItemInput[];
  discount_amount?: number;
  payment_method: PaymentMethod;
  received_amount: number;
  note?: string;
}

export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
  unit_price?: number;
  discount?: number;
}

// Kết quả trả về sau khi tạo hóa đơn
export interface OrderResult {
  order: Order;
  order_details: OrderDetail[];
  payment: Payment;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
  customer_id?: string;
  status?: OrderStatus | 'all';
  payment_status?: PaymentStatus | 'all';
}
