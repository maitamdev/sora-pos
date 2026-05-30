export interface Supplier {
  id: string;
  store_id: string;
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

export interface CreateSupplierInput {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
  is_active?: boolean;
}

export interface SupplierFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
}
