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
  status: string;
  payment_status: string;
  note?: string;
  created_at: string;
  customers?: { id?: string; name: string; phone?: string; email?: string; points?: number; total_spent?: number };
  users?: { id?: string; full_name: string; email?: string };
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
  products?: {
    id: string;
    sku: string;
    name: string;
    image_url?: string;
    unit?: string;
  };
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  received_amount: number;
  change_amount: number;
  status: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  discount: number;
  subtotal: number;
  stock_quantity: number;
  image_url?: string;
  unit?: string;
}

export interface CreateOrderPayload {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    discount?: number;
  }>;
  discount_amount?: number;
  payment_method: PaymentMethod;
  received_amount?: number;
  note?: string;
}

export interface OrderResult {
  order: Order;
  order_details: OrderDetail[];
  payment: Payment | null;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
  customer_id?: string;
  status?: 'completed' | 'cancelled' | 'refunded' | 'all';
  payment_status?: 'paid' | 'unpaid' | 'partial' | 'all';
}

export interface GetOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
