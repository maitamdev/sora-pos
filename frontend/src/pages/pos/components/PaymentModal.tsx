import { HiOutlineCheckCircle, HiX } from 'react-icons/hi';
import { PaymentMethod } from '../../../types/order.type';
import { formatCurrency } from '../../../utils/format';

interface PaymentModalProps {
  isOpen: boolean;
  paymentMethod: PaymentMethod;
  total: number;
  receivedAmount: number;
  submitting: boolean;
  onClose: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onReceivedAmountChange: (amount: number) => void;
  onConfirm: () => void;
}

const paymentOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'cash', label: 'Tien mat' },
  { value: 'bank_transfer', label: 'Chuyen khoan' },
  { value: 'e_wallet', label: 'Vi dien tu' },
  { value: 'qr_mock', label: 'QR mock' },
];

export default function PaymentModal({
  isOpen,
  paymentMethod,
  total,
  receivedAmount,
  submitting,
  onClose,
  onPaymentMethodChange,
  onReceivedAmountChange,
  onConfirm,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const effectiveReceived = paymentMethod === 'cash' ? receivedAmount : total;
  const changeAmount = Math.max(effectiveReceived - total, 0);
  const canConfirm = paymentMethod !== 'cash' || receivedAmount >= total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Thanh toan</h2>
            <p className="text-sm text-slate-500">Xac nhan phuong thuc va so tien nhan.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Can thanh toan</div>
            <div className="mt-1 text-2xl font-bold text-primary-600">{formatCurrency(total)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {paymentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onPaymentMethodChange(option.value)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  paymentMethod === option.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {paymentMethod === 'cash' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tien khach dua</label>
              <input
                type="number"
                value={receivedAmount || ''}
                onChange={(e) => onReceivedAmountChange(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-right text-lg font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                placeholder="0"
              />
              <div className={`mt-2 text-sm ${canConfirm ? 'text-emerald-600' : 'text-red-600'}`}>
                Tien thua: {canConfirm ? formatCurrency(changeAmount) : 'Chua du tien'}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center">
              <div className="text-sm font-medium text-slate-700">
                {paymentMethod === 'qr_mock' ? 'Ma QR mock da san sang' : 'Giao dich duoc ghi nhan la da thanh toan'}
              </div>
              <div className="mt-1 text-xs text-slate-400">Backend se tao payment theo tong tien hoa don.</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Huy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || submitting}
            className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlineCheckCircle className="h-5 w-5" />
            {submitting ? 'Dang xu ly...' : 'Xac nhan'}
          </button>
        </div>
      </div>
    </div>
  );
}
