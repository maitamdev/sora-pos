export interface StockTransaction {
  id: string;
  product_id: string;
  type: 'import' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  note?: string;
  user_id: string;
  created_at: string;
  products?: { name: string; sku: string };
  users?: { full_name: string };
}

export interface StockAlert {
  id: string;
  product_id: string;
  current_stock: number;
  min_stock_level: number;
  status: 'low_stock' | 'out_of_stock' | 'resolved';
  created_at: string;
  products?: { name: string; sku: string; stock_quantity: number; min_stock_level: number; unit: string };
}
