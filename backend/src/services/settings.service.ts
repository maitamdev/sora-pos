import { supabase } from '../config/supabase';
import { UpdateStoreSettingsInput } from '../types/settings.type';

export class SettingsService {
  /**
   * Lấy cài đặt của cửa hàng.
   * Nếu chưa tồn tại, tự động tạo mới với giá trị mặc định.
   */
  static async get(storeId: string) {
    const { data: existing, error } = await supabase
      .from('settings')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle();

    if (error) {
      throw new Error('Lỗi khi lấy cài đặt cửa hàng: ' + error.message);
    }

    if (existing) {
      return existing;
    }

    // Lấy thông tin tên cửa hàng từ bảng stores để làm tên mặc định
    const { data: store } = await supabase
      .from('stores')
      .select('name')
      .eq('id', storeId)
      .single();

    const defaultName = store?.name || 'Sora POS';

    // Tạo mới bản ghi cài đặt mặc định
    const { data: created, error: createError } = await supabase
      .from('settings')
      .insert({
        store_id: storeId,
        store_name: defaultName,
        store_address: '',
        store_phone: '',
        store_tax_code: '',
        receipt_footer: 'Cảm ơn quý khách và hẹn gặp lại!',
        default_payment_method: 'cash',
        require_customer: false,
        hide_out_of_stock: false,
        show_product_images: true,
        auto_print_receipt: false,
        max_discount_percent: 100,
      })
      .select()
      .single();

    if (createError) {
      throw new Error('Tạo cài đặt mặc định thất bại: ' + createError.message);
    }

    return created;
  }

  /**
   * Cập nhật cài đặt cửa hàng (Upsert)
   */
  static async update(storeId: string, input: UpdateStoreSettingsInput) {
    // Đảm bảo không ghi đè store_id
    const payload = {
      ...input,
      store_id: storeId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('settings')
      .upsert(payload, { onConflict: 'store_id' })
      .select()
      .single();

    if (error) {
      throw new Error('Cập nhật cài đặt cửa hàng thất bại: ' + error.message);
    }

    return data;
  }
}
