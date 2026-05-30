-- ============================================
-- Sora POS - Add Settings Table
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  store_name VARCHAR(255) DEFAULT 'Sora POS',
  store_address TEXT DEFAULT '',
  store_phone VARCHAR(20) DEFAULT '',
  store_tax_code VARCHAR(50) DEFAULT '',
  receipt_footer TEXT DEFAULT 'Cảm ơn quý khách và hẹn gặp lại!',
  default_payment_method VARCHAR(50) DEFAULT 'cash',
  require_customer BOOLEAN DEFAULT FALSE,
  hide_out_of_stock BOOLEAN DEFAULT FALSE,
  show_product_images BOOLEAN DEFAULT TRUE,
  auto_print_receipt BOOLEAN DEFAULT FALSE,
  max_discount_percent INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by store_id
CREATE INDEX IF NOT EXISTS idx_settings_store_id ON settings(store_id);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
