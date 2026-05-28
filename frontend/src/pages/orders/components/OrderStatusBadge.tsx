interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config =
    status === 'completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'cancelled'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';

  const label =
    status === 'completed'
      ? 'Hoàn thành'
      : status === 'cancelled'
        ? 'Đã hủy'
        : status === 'refunded'
          ? 'Hoàn trả'
          : status;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config}`}>
      {label}
    </span>
  );
}
