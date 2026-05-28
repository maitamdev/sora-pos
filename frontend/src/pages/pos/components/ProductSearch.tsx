import { HiOutlineQrcode, HiOutlineSearch } from 'react-icons/hi';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function ProductSearch({ value, onChange, onSubmit }: ProductSearchProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <HiOutlineSearch className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="Tim san pham theo ten, SKU, barcode hoac QR..."
          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          autoFocus
        />
      </div>
      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        title="Tim hoac quet QR"
      >
        <HiOutlineQrcode className="h-5 w-5" />
      </button>
    </div>
  );
}
