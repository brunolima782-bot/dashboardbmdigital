import { aggregateMetrics, MetricRow, PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/metrics";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

export default function PlatformPerformanceCard({ platform, rows }: { platform: string; rows: MetricRow[] }) {
  const agg = aggregateMetrics(rows);
  const color = PLATFORM_COLORS[platform] || "#64748b";

  const items = [
    { label: "Investimento", value: formatCurrency(agg.investment) },
    { label: "Impressões", value: formatNumber(agg.impressions) },
    { label: "Cliques", value: formatNumber(agg.clicks) },
    { label: "CTR", value: formatPercent(agg.ctr) },
    { label: "CPC", value: formatCurrency(agg.cpc) },
    { label: "Leads", value: formatNumber(agg.leads) },
    { label: "CPL", value: formatCurrency(agg.cpl) },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{PLATFORM_LABELS[platform] || platform}</h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-slate-400">{item.label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
