import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function RoiHighlight({
  investment,
  returnValue,
}: {
  investment: number;
  returnValue: number;
}) {
  if (investment <= 0 || returnValue <= 0) return null;

  const roas = returnValue / investment;
  const profit = returnValue - investment;
  const positive = profit >= 0;
  const maxValue = Math.max(investment, returnValue);
  const investmentPct = Math.max((investment / maxValue) * 100, 4);
  const returnPct = Math.max((returnValue / maxValue) * 100, 4);

  return (
    <section className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-500/5 p-6 sm:p-8">
      <p className="text-center text-xs font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mb-2">
        Retorno sobre o investimento
      </p>
      <p className="text-center text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Para cada{" "}
        <span className="text-slate-500 dark:text-slate-400 font-semibold">R$ 1,00</span> investido, voltaram{" "}
        <span className="text-emerald-600 dark:text-emerald-400">
          {roas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </p>

      <div className="max-w-xl mx-auto space-y-4">
        <div>
          <div className="flex items-baseline justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">Investido</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(investment)}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-slate-400 dark:bg-slate-500" style={{ width: `${investmentPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">Retorno em vendas</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(returnValue)}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${returnPct}%` }} />
          </div>
        </div>
      </div>

      <div
        className={`mt-6 flex items-center justify-center gap-2 text-sm font-semibold ${
          positive ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
        }`}
      >
        {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {positive
          ? `Lucro de ${formatCurrency(profit)} acima do valor investido`
          : `Ainda ${formatCurrency(Math.abs(profit))} abaixo do valor investido`}
      </div>
    </section>
  );
}
