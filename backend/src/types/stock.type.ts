export type StockTransactionType = 'import' | 'sale' | 'adjustment' | 'return';
export type StockAlertStatus = 'low_stock' | 'out_of_stock' | 'resolved';

export interface StockTransaction {
  id: string;
  product_id: string;
  type: StockTransactionType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string;
  note?: string;
  user_id: string;
  created_at: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  current_stock: number;
  min_stock_level: number;
  status: StockAlertStatus;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

// Input nhập kho
export interface StockImportInput {
  product_id: string;
  quantity: number;
  note?: string;
}

// Input điều chỉnh tồn kho
export interface StockAdjustmentInput {
  product_id: string;
  new_quantity: number;
  reason: string;
}
