import clsx from "clsx";

const VARIANTS = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
};

export default function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
}) {
  return <span className={clsx("badge", VARIANTS[variant])}>{children}</span>;
}
