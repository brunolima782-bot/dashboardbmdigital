import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, Lightbulb, ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolvePeriod, PeriodPreset } from "@/lib/period";
import { aggregateMetrics, PLATFORM_LABELS } from "@/lib/metrics";
import { formatCurrency, formatNumber, formatPercent, formatDateLong } from "@/lib/formatters";
import { generateInsights, generateRecommendations, generateExecutiveSummary } from "@/lib/insights";
import ChartCard from "@/components/charts/ChartCard";
import PlatformPieChart from "@/components/charts/PlatformPieChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import PlatformComparisonTable from "@/components/clients/PlatformComparisonTable";
import PlatformPerformanceCard from "@/components/reports/PlatformPerformanceCard";
import ExportPdfButton from "@/components/reports/ExportPdfButton";
import RoiHighlight from "@/components/reports/RoiHighlight";
import Badge from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

function dayLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: { clientId: string };
  searchParams: { period?: string; start?: string; end?: string; platforms?: string };
}) {
  const client = await prisma.client.findUnique({ where: { id: params.clientId } });
  if (!client) notFound();

  const settings = await prisma.agencySettings.findFirst();
  const agencyName = settings?.agencyName || "Minha Agência";

  const period = (searchParams.period as PeriodPreset) || "thisMonth";
  const { start, end, previousStart, previousEnd } = resolvePeriod(period, searchParams.start, searchParams.end);
  const selectedPlatforms = (searchParams.platforms || "META,GOOGLE,LINKEDIN").split(",").filter(Boolean);

  const [investments, previousInvestments] = await Promise.all([
    prisma.investment.findMany({
      where: { clientId: client.id, date: { gte: start, lte: end }, platform: { in: selectedPlatforms as ("META" | "GOOGLE" | "LINKEDIN")[] } },
      orderBy: { date: "asc" },
    }),
    prisma.investment.findMany({
      where: { clientId: client.id, date: { gte: previousStart, lte: previousEnd }, platform: { in: selectedPlatforms as ("META" | "GOOGLE" | "LINKEDIN")[] } },
    }),
  ]);

  const totals = aggregateMetrics(investments);
  const byPlatform = selectedPlatforms.map((platform) => ({
    platform,
    rows: investments.filter((i) => i.platform === platform),
  }));
  const previousByPlatform = selectedPlatforms.map((platform) => ({
    platform,
    rows: previousInvestments.filter((i) => i.platform === platform),
  }));

  const activePlatforms = byPlatform.filter((p) => aggregateMetrics(p.rows).investment > 0).map((p) => p.platform);
  const pieData = byPlatform.map((p) => ({ platform: p.platform, value: aggregateMetrics(p.rows).investment }));

  const dailyMap = new Map<string, number>();
  for (const inv of investments) {
    const key = dayLabel(inv.date);
    dailyMap.set(key, (dailyMap.get(key) || 0) + inv.amount);
  }
  const evolutionData = Array.from(dailyMap.entries()).map(([label, value]) => ({ label, value }));

  const insights = generateInsights(byPlatform, investments, previousInvestments);
  const recommendations = generateRecommendations(investments, previousInvestments);
  const executiveSummary = generateExecutiveSummary(investments, activePlatforms);

  const periodLabel = `${formatDateLong(start)} — ${formatDateLong(end)}`;
  const fileName = `Relatorio-${client.companyName.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-pdf-hide>
        <Link href="/relatorios" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para relatórios
        </Link>
        <ExportPdfButton
          elementId="report-content"
          fileName={fileName}
          agencyName={agencyName}
          reportTitle={`${client.companyName} · ${periodLabel}`}
        />
      </div>

      <div id="report-content" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-12">
        {/* Capa */}
        <section className="text-center py-10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center gap-3 mb-8">
            {settings?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt={agencyName} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
            )}
            <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{agencyName}</span>
          </div>
          <p className="text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Relatório de Performance
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {client.companyName.toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{periodLabel}</p>
          <div className="mt-6 flex justify-center flex-wrap gap-2">
            {selectedPlatforms.map((p) => (
              <Badge key={p} variant="brand">
                {PLATFORM_LABELS[p]}
              </Badge>
            ))}
          </div>
        </section>

        <RoiHighlight investment={totals.investment} returnValue={totals.conversionValue} />

        {/* Resumo executivo */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Resumo executivo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Principais indicadores do período analisado
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Investimento total", value: formatCurrency(totals.investment) },
              { label: "Leads", value: formatNumber(totals.leads) },
              { label: "Conversões", value: formatNumber(totals.conversions) },
              { label: "CPL", value: formatCurrency(totals.cpl) },
              { label: "Cliques", value: formatNumber(totals.clicks) },
              { label: "Impressões", value: formatNumber(totals.impressions) },
              { label: "CTR", value: formatPercent(totals.ctr) },
              { label: "ROAS", value: totals.roas > 0 ? `${totals.roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x` : "—" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-500/5 p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{executiveSummary}</p>
          </div>
        </section>

        {/* Gráficos */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Investimento no período</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Investimento por plataforma">
              <PlatformPieChart data={pieData} />
            </ChartCard>
            <ChartCard title="Evolução do investimento">
              <TrendLineChart data={evolutionData} color="#4f46e5" format="currency" />
            </ChartCard>
          </div>
        </section>

        {/* Performance por plataforma */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Performance por plataforma</h2>
          <div className="space-y-4">
            {byPlatform.map((p) => (
              <PlatformPerformanceCard key={p.platform} platform={p.platform} rows={p.rows} />
            ))}
          </div>
        </section>

        {/* Tabela comparativa */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Comparativo entre plataformas</h2>
          <PlatformComparisonTable byPlatform={byPlatform} />
        </section>

        {/* Insights */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Principais insights</h2>
          </div>
          <ul className="space-y-2.5">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                {insight}
              </li>
            ))}
          </ul>
        </section>

        {/* Recomendações */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <ListChecks className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Próximos passos</h2>
          </div>
          <ul className="space-y-2.5">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                {rec}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-400 italic">
            As recomendações acima são sugestões baseadas nos dados registrados e não substituem a análise estratégica do gestor de tráfego.
          </p>
        </section>

        <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          Relatório de Performance — {agencyName}
        </footer>
      </div>
    </div>
  );
}
