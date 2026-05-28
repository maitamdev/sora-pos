interface PaymentStatusBadgeProps {
  status: string;
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config =
    status === 'paid'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : status === 'partial'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-slate-200 bg-slate-50 text-slate-600';

  const label = status === 'paid' ? 'Đã thanh toán' : status === 'partial' ? 'Thanh toán một phần' : 'Chưa thanh toán';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config}`}>
      {label}
    </span>
  );
}
