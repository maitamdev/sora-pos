interface LowStockBadgeProps {
  stockQuantity: number;
  minStockLevel: number;
}

export default function LowStockBadge({ stockQuantity, minStockLevel }: LowStockBadgeProps) {
  if (stockQuantity > minStockLevel) return null;

  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      Tồn thấp
    </span>
  );
}
