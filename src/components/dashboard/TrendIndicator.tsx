import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TrendIndicatorProps {
  current: number;
  prev: number;
  invertColors?: boolean;
}

export function TrendIndicator({ current, prev, invertColors = false }: TrendIndicatorProps) {
  if (prev === 0 && current === 0) return null;
  const diff = current - prev;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  
  let colorClass = "text-stone-400 bg-stone-100/50";
  if (isPositive) {
    colorClass = invertColors ? "text-rose-600 bg-rose-50 border border-rose-100" : "text-emerald-600 bg-emerald-50 border border-emerald-100";
  } else if (isNegative) {
    colorClass = invertColors ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100";
  }

  let Icon = null;
  if (isPositive) Icon = ArrowUpRight;
  if (isNegative) Icon = ArrowDownRight;

  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all ${colorClass}`}>
      {Icon && <Icon size={14} strokeWidth={3} />}
      {prev === 0 ? "Novo" : `${Math.abs((diff / Math.abs(prev)) * 100).toFixed(1)}%`}
    </div>
  );
}
