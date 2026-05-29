import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCog,
  HiOutlineCreditCard,
  HiOutlineOfficeBuilding,
  HiOutlinePrinter,
  HiOutlineRefresh,
  HiOutlineSave,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { PaymentMethod } from '../../types/order.type';
import { defaultPOSSettings, POSSettings, useSettingsStore } from '../../stores/settings.store';

const paymentOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'bank_transfer', label: 'Chuyển khoản' },
  { value: 'e_wallet', label: 'Ví điện tử' },
  { value: 'qr_mock', label: 'QR mock' },
];

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="mt-1 block text-xs text-slate-500">{description}</span>
      </span>
      <span
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const storeName = useSettingsStore((state) => state.storeName);
  const storeAddress = useSettingsStore((state) => state.storeAddress);
  const storePhone = useSettingsStore((state) => state.storePhone);
  const storeTaxCode = useSettingsStore((state) => state.storeTaxCode);
  const receiptFooter = useSettingsStore((state) => state.receiptFooter);
  const defaultPaymentMethod = useSettingsStore((state) => state.defaultPaymentMethod);
  const requireCustomer = useSettingsStore((state) => state.requireCustomer);
  const hideOutOfStock = useSettingsStore((state) => state.hideOutOfStock);
  const showProductImages = useSettingsStore((state) => state.showProductImages);
  const autoPrintReceipt = useSettingsStore((state) => state.autoPrintReceipt);
  const maxDiscountPercent = useSettingsStore((state) => state.maxDiscountPercent);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const savedSettings: POSSettings = {
    storeName,
    storeAddress,
    storePhone,
    storeTaxCode,
    receiptFooter,
    defaultPaymentMethod,
    requireCustomer,
    hideOutOfStock,
    showProductImages,
    autoPrintReceipt,
    maxDiscountPercent,
  };

  const [form, setForm] = useState<POSSettings>(savedSettings);

  useEffect(() => {
    setForm(savedSettings);
  }, [
    storeName,
    storeAddress,
    storePhone,
    storeTaxCode,
    receiptFooter,
    defaultPaymentMethod,
    requireCustomer,
    hideOutOfStock,
    showProductImages,
    autoPrintReceipt,
    maxDiscountPercent,
  ]);

  const updateField = <K extends keyof POSSettings>(field: K, value: POSSettings[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings({
      ...form,
      storeName: form.storeName.trim() || defaultPOSSettings.storeName,
      maxDiscountPercent: Math.min(Math.max(Number(form.maxDiscountPercent) || 0, 0), 100),
    });
    toast.success('Đã lưu cài đặt POS');
  };

  const handleReset = () => {
    resetSettings();
    setForm(defaultPOSSettings);
    toast.success('Đã khôi phục cài đặt mặc định');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Cài đặt POS</h1>
          <p className="page-subtitle">Tùy biến vận hành bán hàng theo từng quán.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <HiOutlineRefresh className="h-5 w-5" />
            Mặc định
          </button>
          <button type="submit" className="btn-primary inline-flex items-center gap-2">
            <HiOutlineSave className="h-5 w-5" />
            Lưu cài đặt
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <HiOutlineOfficeBuilding className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Thông tin quán</h2>
                <p className="text-sm text-slate-500">Hiển thị trên màn hình hóa đơn và phiếu in nhanh.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Tên quán</label>
                <input
                  value={form.storeName}
                  onChange={(event) => updateField('storeName', event.target.value)}
                  className="input-field"
                  placeholder="Ví dụ: Sora Coffee"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Số điện thoại</label>
                <input
                  value={form.storePhone}
                  onChange={(event) => updateField('storePhone', event.target.value)}
                  className="input-field"
                  placeholder="090..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Mã số thuế</label>
                <input
                  value={form.storeTaxCode}
                  onChange={(event) => updateField('storeTaxCode', event.target.value)}
                  className="input-field"
                  placeholder="Nếu có"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Địa chỉ</label>
                <input
                  value={form.storeAddress}
                  onChange={(event) => updateField('storeAddress', event.target.value)}
                  className="input-field"
                  placeholder="Địa chỉ quán"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Lời cảm ơn trên hóa đơn</label>
              <textarea
                value={form.receiptFooter}
                onChange={(event) => updateField('receiptFooter', event.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Cảm ơn quý khách..."
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <HiOutlineCreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Thanh toán và giảm giá</h2>
                <p className="text-sm text-slate-500">Đặt cách thu ngân mặc định xử lý đơn hàng.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Phương thức mặc định</label>
                <select
                  value={form.defaultPaymentMethod}
                  onChange={(event) => updateField('defaultPaymentMethod', event.target.value as PaymentMethod)}
                  className="input-field bg-white"
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Giảm giá tối đa (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.maxDiscountPercent}
                  onChange={(event) => updateField('maxDiscountPercent', Number(event.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ToggleField
                label="Bắt buộc chọn khách hàng"
                description="Chặn thanh toán khi hóa đơn chưa gắn khách."
                checked={form.requireCustomer}
                onChange={(checked) => updateField('requireCustomer', checked)}
              />
              <ToggleField
                label="Tự động in sau thanh toán"
                description="Mở hộp thoại in ngay khi tạo hóa đơn xong."
                checked={form.autoPrintReceipt}
                onChange={(checked) => updateField('autoPrintReceipt', checked)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <HiOutlineCog className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Hiển thị bán hàng</h2>
                <p className="text-sm text-slate-500">Điều chỉnh danh sách sản phẩm cho tốc độ thao tác tại quầy.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ToggleField
                label="Ẩn sản phẩm hết hàng"
                description="Không hiện món có tồn kho bằng 0 trên POS."
                checked={form.hideOutOfStock}
                onChange={(checked) => updateField('hideOutOfStock', checked)}
              />
              <ToggleField
                label="Hiện ảnh sản phẩm"
                description="Tắt nếu cần giao diện gọn hơn cho thiết bị yếu."
                checked={form.showProductImages}
                onChange={(checked) => updateField('showProductImages', checked)}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
              <HiOutlinePrinter className="h-5 w-5" />
              Xem trước hóa đơn
            </div>
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-lg font-black text-slate-950">{form.storeName || defaultPOSSettings.storeName}</div>
              {form.storeAddress && <div className="mt-1 text-xs text-slate-500">{form.storeAddress}</div>}
              {form.storePhone && <div className="mt-1 text-xs text-slate-500">SĐT: {form.storePhone}</div>}
              {form.storeTaxCode && <div className="mt-1 text-xs text-slate-500">MST: {form.storeTaxCode}</div>}
              <div className="my-4 border-t border-dashed border-slate-300" />
              <div className="flex justify-between text-sm">
                <span>Sản phẩm mẫu</span>
                <span>50.000 đ</span>
              </div>
              <div className="mt-3 flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span>50.000 đ</span>
              </div>
              {form.receiptFooter && <div className="mt-5 text-xs text-slate-500">{form.receiptFooter}</div>}
            </div>
          </section>

          <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
              <HiOutlineShieldCheck className="h-5 w-5" />
              Áp dụng vào POS
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-3">
                <span>Thanh toán mặc định</span>
                <span className="font-semibold text-slate-900">
                  {paymentOptions.find((option) => option.value === form.defaultPaymentMethod)?.label}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Khách hàng</span>
                <span className="font-semibold text-slate-900">{form.requireCustomer ? 'Bắt buộc' : 'Không bắt buộc'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Giảm giá tối đa</span>
                <span className="font-semibold text-slate-900">{form.maxDiscountPercent}%</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
