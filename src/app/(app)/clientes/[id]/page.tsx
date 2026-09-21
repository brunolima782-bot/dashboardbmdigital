import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, FileBarChart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolvePeriod, PeriodPreset } from "@/lib/period";
import { aggregateMetrics, percentChange, PLATFORM_LABELS } from "@/lib/metrics";
import { formatCurrency, formatDateLong } from "@/lib/formatters";
import StatCard from "@/components/ui/StatCard";
import PeriodSelector from "@/components/ui/PeriodSelector";
import BudgetBar from "@/components/ui/BudgetBar";
import ChartCard from "@/components/charts/ChartCard";
import PlatformPieChart from "@/components/charts/PlatformPieChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import RankingBarChart from "@/components/charts/RankingBarChart";
import PlatformComparisonTable from "@/components/clients/PlatformComparisonTable";
import Badge from "@/components/ui/Badge";
import { Wallet as WalletIcon, Target, MousePointerClick, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function dayLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default async function ClientDashboardPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { period?: string; start?: string; end?: string };
}) {
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  const period = (searchParams.period as PeriodPreset) || "thisMonth";
  const { start, end, previousStart, previousEnd } = resolvePeriod(period, searchParams.start, searchParams.end);

  const [investments, previousInvestments] = await Promise.all([
    prisma.investment.findMany({ where: { clientId: client.id, date: { gte: start, lte: end } }, orderBy: { date: "asc" } }),
    prisma.investment.findMany({ where: { clientId: client.id, date: { gte: previousStart, lte: previousEnd } } }),
  ]);

  const now = new Date();
  const [budget, monthInvestments] = await Promise.all([
    prisma.budget.findUnique({
      where: { clientId_month_year: { clientId: client.id, month: now.getMonth() + 1, year: now.getFullYear() } },
    }),
    prisma.investment.findMany({
      where: {
        clientId: client.id,
        date: { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999) },
      },
      select: { amount: true },
    }),
  ]);

  const totals = aggregateMetrics(investments);
  const previousTotals = aggregateMetrics(previousInvestments);
  const invChange = percentChange(totals.investment, previousTotals.investment);

  const platforms = ["META", "GOOGLE", "LINKEDIN"];
  const byPlatform = platforms.map((platform) => ({
    platform,
    rows: investments.filter((i) => i.platform === platform),
  }));
  const previousByPlatform = platforms.map((platform) => ({
    platform,
    rows: previousInvestments.filter((i) => i.platform === platform),
  }));

  const pieData = byPlatform.map((p) => ({ platform: p.platform, value: aggregateMetrics(p.rows).investment }));

  // Evolução diária do investimento
  const dailyMap = new Map<string, number>();
  const leadsMap = new Map<string, number>();
  const cplMap = new Map<string, { inv: number; leads: number }>();
  for (const inv of investments) {
    const key = dayLabel(inv.date);
    dailyMap.set(key, (dailyMap.get(key) || 0) + inv.amount);
    leadsMap.set(key, (leadsMap.get(key) || 0) + (inv.leads || 0));
    const cur = cplMap.get(key) || { inv: 0, leads: 0 };
    cplMap.set(key, { inv: cur.inv + inv.amount, leads: cur.leads + (inv.leads || 0) });
  }
  const evolutionData = Array.from(dailyMap.entries()).map(([label, value]) => ({ label, value }));
  const leadsData = Array.from(leadsMap.entries()).map(([label, value]) => ({ label, value }));
  const cplData = Array.from(cplMap.entries()).map(([label, v]) => ({
    label,
    value: v.leads > 0 ? v.inv / v.leads : 0,
  }));

  // Ranking por campanha
  const campaignMap = new Map<string, number>();
  for (const inv of investments) {
    campaignMap.set(inv.campaignName, (campaignMap.get(inv.campaignName) || 0) + inv.amount);
  }
  const campaignData = Array.from(campaignMap.entries()).map(([name, value]) => ({ name, value }));

  const monthInvested = monthInvestments.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl text-lg font-semibold text-white"
            style={{ backgroundColor: client.logoUrl ? undefined : client.brandColor }}
          >
            {client.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={client.logoUrl} alt={client.companyName} className="h-full w-full object-cover" />
            ) : (
              client.companyName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{client.companyName}</h2>
              <Badge variant={client.status === "ACTIVE" ? "success" : "neutral"}>
                {client.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatDateLong(start)} — {formatDateLong(end)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/clientes/${client.id}/editar`} className="btn-secondary text-sm">
            <Pencil className="h-4 w-4" /> Editar
          </Link>
          <Link href={`/relatorios?clientId=${client.id}`} className="btn-secondary text-sm">
            <FileBarChart className="h-4 w-4" /> Gerar relatório
          </Link>
          <Link href={`/investimentos?clientId=${client.id}`} className="btn-primary text-sm">
            <Plus className="h-4 w-4" /> Adicionar investimento
          </Link>
        </div>
      </div>

      <PeriodSelector current={period} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Investimento total"
          value={formatCurrency(totals.investment)}
          icon={WalletIcon}
          iconColor="text-brand-600"
          iconBg="bg-brand-50 dark:bg-brand-500/10"
          changePercent={invChange}
        />
        <StatCard
          label="Meta Ads"
          value={formatCurrency(aggregateMetrics(byPlatform[0].rows).investment)}
          icon={MousePointerClick}
          iconColor="text-[#1877F2]"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          changePercent={percentChange(
            aggregateMetrics(byPlatform[0].rows).investment,
            aggregateMetrics(previousByPlatform[0].rows).investment
          )}
        />
        <StatCard
          label="Google Ads"
          value={formatCurrency(aggregateMetrics(byPlatform[1].rows).investment)}
          icon={Target}
          iconColor="text-[#34A853]"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          changePercent={percentChange(
            aggregateMetrics(byPlatform[1].rows).investment,
            aggregateMetrics(previousByPlatform[1].rows).investment
          )}
        />
        <StatCard
          label="LinkedIn Ads"
          value={formatCurrency(aggregateMetrics(byPlatform[2].rows).investment)}
          icon={TrendingUp}
          iconColor="text-[#0A66C2]"
          iconBg="bg-sky-50 dark:bg-sky-950/40"
          changePercent={percentChange(
            aggregateMetrics(byPlatform[2].rows).investment,
            aggregateMetrics(previousByPlatform[2].rows).investment
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <BudgetBar
            clientId={client.id}
            month={now.getMonth() + 1}
            year={now.getFullYear()}
            budgetAmount={budget?.amount || 0}
            invested={monthInvested}
          />
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Investimento por plataforma" subtitle="Distribuição no período selecionado">
            <PlatformPieChart data={pieData} />
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Evolução do investimento" subtitle="Investimento diário no período">
          <TrendLineChart data={evolutionData} color="#4f46e5" format="currency" />
        </ChartCard>
        <ChartCard title="Investimento por campanha" subtitle="Campanhas com maior investimento">
          <RankingBarChart data={campaignData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Evolução de leads" subtitle="Leads gerados por dia no período">
          <TrendLineChart data={leadsData} color="#059669" format="number" />
        </ChartCard>
        <ChartCard title="Evolução do CPL" subtitle="Custo por lead ao longo do período">
          <TrendLineChart data={cplData} color="#db2777" format="currency" />
        </ChartCard>
      </div>

      <PlatformComparisonTable byPlatform={byPlatform} />
    </div>
  );
}
