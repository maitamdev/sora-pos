export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  cost_price: number;
  sell_price: number;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  points: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  cost_price: number;
  sell_price: number;
  stock_quantity?: number;
  min_stock_level?: number;
  unit?: string;
  image_url?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  cost_price?: number;
  sell_price?: number;
  min_stock_level?: number;
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}
