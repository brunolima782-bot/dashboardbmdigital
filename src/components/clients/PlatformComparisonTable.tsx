import { aggregateMetrics, MetricRow, PLATFORM_LABELS } from "@/lib/metrics";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

export default function PlatformComparisonTable({
  byPlatform,
}: {
  byPlatform: { platform: string; rows: MetricRow[] }[];
}) {
  const allRows = byPlatform.flatMap((p) => p.rows);
  const total = aggregateMetrics(allRows);

  return (
    <div className="card overflow-hidden">
      <div className="p-5 pb-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Comparação entre plataformas</h3>
        <p className="text-xs text-slate-400 mt-0.5">Métricas consolidadas do período selecionado</p>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-400">
              <th className="px-5 py-2.5 font-medium">Plataforma</th>
              <th className="px-3 py-2.5 font-medium text-right">Investimento</th>
              <th className="px-3 py-2.5 font-medium text-right">Impressões</th>
              <th className="px-3 py-2.5 font-medium text-right">Cliques</th>
              <th className="px-3 py-2.5 font-medium text-right">CTR</th>
              <th className="px-3 py-2.5 font-medium text-right">CPC</th>
              <th className="px-3 py-2.5 font-medium text-right">Leads</th>
              <th className="px-5 py-2.5 font-medium text-right">CPL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {byPlatform.map((p) => {
              const agg = aggregateMetrics(p.rows);
              return (
                <tr key={p.platform} className="text-slate-700 dark:text-slate-300">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                    {PLATFORM_LABELS[p.platform] || p.platform}
                  </td>
                  <td className="px-3 py-3 text-right">{formatCurrency(agg.investment)}</td>
                  <td className="px-3 py-3 text-right">{formatNumber(agg.impressions)}</td>
                  <td className="px-3 py-3 text-right">{formatNumber(agg.clicks)}</td>
                  <td className="px-3 py-3 text-right">{formatPercent(agg.ctr)}</td>
                  <td className="px-3 py-3 text-right">{formatCurrency(agg.cpc)}</td>
                  <td className="px-3 py-3 text-right">{formatNumber(agg.leads)}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(agg.cpl)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-white">
              <td className="px-5 py-3">Total</td>
              <td className="px-3 py-3 text-right">{formatCurrency(total.investment)}</td>
              <td className="px-3 py-3 text-right">{formatNumber(total.impressions)}</td>
              <td className="px-3 py-3 text-right">{formatNumber(total.clicks)}</td>
              <td className="px-3 py-3 text-right">{formatPercent(total.ctr)}</td>
              <td className="px-3 py-3 text-right">{formatCurrency(total.cpc)}</td>
              <td className="px-3 py-3 text-right">{formatNumber(total.leads)}</td>
              <td className="px-5 py-3 text-right">{formatCurrency(total.cpl)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
