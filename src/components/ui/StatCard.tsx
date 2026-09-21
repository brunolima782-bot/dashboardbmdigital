import { LucideIcon, ArrowUp, ArrowDown, Minus } from "lucide-react";
import clsx from "clsx";

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-brand-600",
  iconBg = "bg-brand-50",
  changePercent,
  changeLabel = "vs. período anterior",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  changePercent?: number | null;
  changeLabel?: string;
}) {
  const hasChange = changePercent !== undefined && changePercent !== null;
  const isPositive = hasChange && (changePercent as number) > 0;
  const isNegative = hasChange && (changePercent as number) < 0;

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {Icon && (
          <div className={clsx("flex h-9 w-9 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={clsx("h-4.5 w-4.5", iconColor)} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {hasChange && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium">
          <span
            className={clsx(
              "flex items-center gap-0.5 rounded-md px-1.5 py-0.5",
              isPositive && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
              isNegative && "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
              !isPositive && !isNegative && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {isPositive && <ArrowUp className="h-3 w-3" />}
            {isNegative && <ArrowDown className="h-3 w-3" />}
            {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
            {Math.abs(changePercent as number).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
          </span>
          <span className="text-slate-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
